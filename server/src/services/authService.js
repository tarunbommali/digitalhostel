const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const BedAllocation = require('../models/BedAllocation');
const Organization = require('../models/Organization');
const {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} = require('../utils/responseHelper');
const AuditService = require('./auditService');

class AuthService {
  static async login(email, password, tenantSlug = null) {
    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }

    const normalizedEmail = email.toLowerCase().trim();
    let query = { email: normalizedEmail };

    if (tenantSlug) {
      const org = await Organization.findOne({ slug: tenantSlug.toLowerCase().trim(), isActive: true });
      if (org) {
        query = {
          email: normalizedEmail,
          $or: [{ organizationId: org._id }, { role: 'super_admin' }],
        };
      }
    }

    const user = await User.findOne(query);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account is disabled. Contact system administrator.');
    }

    user.lastLoginAt = new Date();
    await user.save();

    // Standardized JWT Payload Contract
    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      moderatorType: user.role === 'moderator' ? user.moderatorType : undefined,
      organizationId: user.organizationId ? user.organizationId.toString() : undefined,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback_jwt_secret_dev_key',
      { expiresIn: '7d' }
    );

    AuditService.recordAuditSafe(
      user.organizationId,
      user._id,
      'USER_LOGIN',
      'User',
      user._id,
      { email: user.email, role: user.role }
    );

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        moderatorType: user.moderatorType,
        organizationId: user.organizationId,
      },
    };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId)
      .select('-password')
      .populate('organizationId', 'name slug branding location settings');

    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    const profile = user.toJSON();

    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id })
        .populate('department', 'name code')
        .populate('academicYear', 'name');

      if (student) {
        const allocation = await BedAllocation.findOne({
          student: student._id,
          isCurrent: true,
        }).populate('room', 'roomNumber hostelBlock');

        profile.studentProfile = student;
        profile.activeAllocation = allocation;
      }
    }

    return profile;
  }

  static async changePassword(userId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Current and new password are required');
    }
    if (newPassword.length < 8) {
      throw new BadRequestError('New password must be at least 8 characters long');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new BadRequestError('Incorrect current password');
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    AuditService.recordAuditSafe(
      user.organizationId,
      user._id,
      'PASSWORD_CHANGED',
      'User',
      user._id
    );

    return { message: 'Password updated successfully' };
  }

  /**
   * Secure Forgot Password:
   * Generates a single-use, 15-minute cryptographically random token,
   * stores only its SHA-256 hash in the database, and returns a generic response
   * to eliminate user enumeration vectors.
   */
  static async forgotPassword(email) {
    const genericResponse = {
      message: 'If the account exists, a password reset link has been dispatched.',
    };

    if (!email) {
      return genericResponse;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return genericResponse;
    }

    // Generate 32-byte cryptographically secure random token
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    // Token expires in 15 minutes
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    AuditService.recordAuditSafe(
      user.organizationId,
      user._id,
      'PASSWORD_RESET_REQUESTED',
      'User',
      user._id,
      { email: user.email }
    );

    // In development / test environment, return rawToken for test automation
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      return {
        ...genericResponse,
        debugResetToken: rawResetToken,
      };
    }

    return genericResponse;
  }

  /**
   * Secure Reset Password:
   * Validates the SHA-256 hash of the supplied reset token and its expiration timestamp.
   * Clears the token fields upon successful reset to enforce single-use protection.
   * Updates passwordChangedAt to invalidate any outstanding JWT sessions.
   */
  static async resetPassword(token, password) {
    if (!token) {
      throw new BadRequestError('Password reset token is required');
    }
    if (!password) {
      throw new BadRequestError('New password is required');
    }
    if (password.length < 8) {
      throw new BadRequestError('New password must be at least 8 characters long');
    }

    // Compute SHA-256 hash of the incoming plaintext token
    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired password reset token. Please request a new one.');
    }

    // Set new password (pre-save hook hashes with bcrypt)
    user.password = password;
    // Clear single-use token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // Invalidate prior JWT tokens
    user.passwordChangedAt = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    AuditService.recordAuditSafe(
      user.organizationId,
      user._id,
      'PASSWORD_RESET_COMPLETED',
      'User',
      user._id,
      { email: user.email }
    );

    return { message: 'Password reset successfully. Please login with your new password.' };
  }
}

module.exports = AuthService;
