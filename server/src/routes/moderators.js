const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { validateObjectId } = require('../middleware/sanitizer');
const {
  asyncHandler,
  sendSuccess,
  sendPaginated,
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require('../utils/responseHelper');
const AuditService = require('../services/auditService');
const { assertPlanQuota } = require('../middleware/planGuard');

router.use(authMiddleware, tenantGuard, requireRole(['admin', 'super_admin']));

// 1. GET /api/moderators (List moderators & staff)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = {
      organizationId: req.organizationId,
      role: { $in: ['moderator', 'admin'] },
    };

    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.moderatorType) {
      filter.moderatorType = req.query.moderatorType;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const [staff, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return sendPaginated(res, staff, { total, page, limit }, 'Staff list retrieved');
  })
);

// 1b. GET /api/moderators/:id (Get single staff member)
router.get(
  '/:id',
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const staffUser = await User.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
      role: { $in: ['moderator', 'admin'] },
    }).select('-password');

    if (!staffUser) {
      throw new NotFoundError('Staff member not found');
    }

    return sendSuccess(res, staffUser, 'Staff member details retrieved');
  })
);

// 2. POST /api/moderators (Create moderator/staff)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const {
      email,
      password,
      firstName,
      lastName,
      fullName,
      phoneNumber,
      phone,
      gender,
      moderatorType,
      role,
    } = req.body;

    if (!email) {
      throw new BadRequestError('Staff email is required');
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ organizationId: req.organizationId, email: cleanEmail });
    if (existing) {
      throw new ConflictError('A staff user with this email already exists in this organization');
    }

    // Plan Quota Check (Basic: 2, Pro: 10, Enterprise: Unlimited)
    const currentStaffCount = await User.countDocuments({
      organizationId: req.organizationId,
      role: { $in: ['moderator', 'admin'] },
      isActive: true,
    });
    await assertPlanQuota(req.organizationId, 'maxModerators', currentStaffCount);

    const validTypes = [
      'administration',
      'discipline_monitor',
      'attendance_only',
      'security_guard',
      'full',
    ];
    const type = validTypes.includes(moderatorType) ? moderatorType : 'administration';
    const staffRole = role === 'admin' ? 'admin' : 'moderator';

    const fName = firstName ? firstName.trim() : (fullName || '').split(' ')[0] || '';
    const lName = lastName ? lastName.trim() : (fullName || '').split(' ').slice(1).join(' ') || '';
    const computedFull = `${fName} ${lName}`.trim() || fullName || 'Staff Member';

    const staffUser = await User.create({
      organizationId: req.organizationId,
      email: cleanEmail,
      password: password || 'StaffPass123!',
      role: staffRole,
      firstName: fName,
      lastName: lName,
      fullName: computedFull,
      phoneNumber: phoneNumber || phone,
      phone: phoneNumber || phone,
      gender: gender || 'male',
      moderatorType: type,
      isActive: true,
    });

    AuditService.recordAuditSafe(
      req.organizationId,
      req.user._id,
      'STAFF_CREATED',
      'User',
      staffUser._id,
      { email: staffUser.email, role: staffUser.role, moderatorType: type }
    );

    return sendSuccess(res, staffUser, 'Staff member created successfully', 201);
  })
);

// 3. PUT /api/moderators/:id/status (Toggle active status)
router.put(
  '/:id/status',
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const staffUser = await User.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!staffUser) {
      throw new NotFoundError('Staff member not found');
    }

    staffUser.isActive = req.body.active !== undefined ? !!req.body.active : !staffUser.isActive;
    await staffUser.save();

    AuditService.recordAuditSafe(
      req.organizationId,
      req.user._id,
      'STAFF_STATUS_UPDATED',
      'User',
      staffUser._id,
      { isActive: staffUser.isActive }
    );

    return sendSuccess(res, staffUser, 'Staff status updated successfully');
  })
);

// 4. PUT /api/moderators/:id (Update staff details)
router.put(
  '/:id',
  validateObjectId('id'),
  asyncHandler(async (req, res) => {
    const staffUser = await User.findOne({ _id: req.params.id, organizationId: req.organizationId });
    if (!staffUser) {
      throw new NotFoundError('Staff member not found');
    }

    const { firstName, lastName, fullName, phoneNumber, phone, gender, moderatorType, role } = req.body;
    if (firstName) staffUser.firstName = firstName.trim();
    if (lastName) staffUser.lastName = lastName.trim();
    if (fullName) staffUser.fullName = fullName.trim();
    if (phoneNumber || phone) {
      staffUser.phoneNumber = phoneNumber || phone;
      staffUser.phone = phoneNumber || phone;
    }
    if (gender) staffUser.gender = gender;
    if (moderatorType) staffUser.moderatorType = moderatorType;
    if (role && ['admin', 'moderator'].includes(role)) staffUser.role = role;

    await staffUser.save();

    AuditService.recordAuditSafe(
      req.organizationId,
      req.user._id,
      'STAFF_UPDATED',
      'User',
      staffUser._id,
      { email: staffUser.email, role: staffUser.role }
    );

    return sendSuccess(res, staffUser, 'Staff details updated successfully');
  })
);

module.exports = router;
