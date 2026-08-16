const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator', 'student'],
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
      required: function () {
        return this.role !== 'super_admin';
      },
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, trim: true },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    assignedGenderHostel: { type: String, enum: ['boys', 'girls', 'co-ed', 'all'], default: 'all' },
    moderatorType: {
      type: String,
      enum: [
        'administration',
        'discipline_monitor',
        'attendance_only',
        'security_guard',
        'full',
      ],
      default: 'administration',
    },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    // Password Reset & Invalidation Security Fields
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    passwordChangedAt: { type: Date },
    tokenVersion: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Tenant-Scoped Unique Index on email
UserSchema.index({ organizationId: 1, email: 1 }, { unique: true });
UserSchema.index({ organizationId: 1, role: 1, moderatorType: 1 });
UserSchema.index({ resetPasswordToken: 1 });

UserSchema.pre('save', async function (next) {
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.fullName;
  }
  if (this.phone && !this.phoneNumber) {
    this.phoneNumber = this.phone;
  } else if (this.phoneNumber && !this.phone) {
    this.phone = this.phoneNumber;
  }

  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
