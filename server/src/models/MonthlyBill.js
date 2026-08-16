const mongoose = require('mongoose');

const MonthlyBillSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    dueAmount: { type: Number },
    billMonth: { type: Number, required: true }, // 1 to 12
    billYear: { type: Number, required: true },
    billingPeriod: { type: String }, // e.g. "2026-08"
    dueDate: { type: Date },
    genderTarget: {
      type: String,
      enum: ['all', 'boys', 'girls'],
      default: 'all',
    },
    status: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid'],
      default: 'unpaid',
      lowercase: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: { type: Date },
    description: { type: String },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Tenant-Scoped Compound Unique Index
MonthlyBillSchema.index(
  { organizationId: 1, student: 1, billMonth: 1, billYear: 1 },
  { unique: true }
);
MonthlyBillSchema.index({ organizationId: 1, status: 1 });
MonthlyBillSchema.index({ organizationId: 1, billYear: 1, billMonth: 1 });

MonthlyBillSchema.pre('save', function (next) {
  this.dueAmount = this.remainingAmount;
  if (!this.billingPeriod) {
    const m = String(this.billMonth).padStart(2, '0');
    this.billingPeriod = `${this.billYear}-${m}`;
  }
  next();
});

module.exports = mongoose.model('MonthlyBill', MonthlyBillSchema);
