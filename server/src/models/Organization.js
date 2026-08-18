const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: { type: String, trim: true },
    supportEmail: { type: String, lowercase: true, trim: true },
    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    branding: {
      primaryColor: { type: String, default: '#6366f1' },
      secondaryColor: { type: String, default: '#4f46e5' },
      logoUrl: { type: String },
      bannerUrl: { type: String },
      faviconUrl: { type: String },
      tagline: { type: String, default: 'Smart Multi-Tenant Hostel Living' },
    },
    settings: {
      maxStudents: { type: Number, default: 500 },
      maxRooms: { type: Number, default: 200 },
      maxStaff: { type: Number, default: 20 },
      allowStudentLeaveRequest: { type: Boolean, default: true },
      allowStudentOutpassRequest: { type: Boolean, default: true },
      defaultCurrency: { type: String, default: 'INR' },
      messBillingEnabled: { type: Boolean, default: true },
    },
    plan: {
      type: String,
      enum: ['BASIC', 'PRO', 'ENTERPRISE'],
      default: 'BASIC',
      uppercase: true,
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'trial', 'inactive', 'cancelled'],
      default: 'active',
      lowercase: true,
      index: true,
    },
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Organization', OrganizationSchema);
