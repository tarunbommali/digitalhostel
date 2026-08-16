const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
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
    paymentMethod: {
      type: String,
      enum: ['sbi_collect', 'cash', 'upi', 'bank_transfer'],
      default: 'sbi_collect',
      required: true,
      lowercase: true,
    },
    referenceId: {
      type: String,
      required: true,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentDate: { type: Date, default: Date.now },
    remarks: { type: String, trim: true },
    recordedBy: {
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

PaymentSchema.index({ organizationId: 1, referenceId: 1 });
PaymentSchema.index({ organizationId: 1, student: 1, paymentDate: -1 });

PaymentSchema.pre('save', function (next) {
  if (!this.transactionId) {
    this.transactionId = this.referenceId;
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
