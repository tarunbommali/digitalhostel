const mongoose = require('mongoose');

const PaymentAllocationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonthlyBill',
      required: true,
    },
    allocatedAmount: {
      type: Number,
      required: true,
      min: 0.01,
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

PaymentAllocationSchema.index({ organizationId: 1, payment: 1 });
PaymentAllocationSchema.index({ organizationId: 1, bill: 1 });

module.exports = mongoose.model('PaymentAllocation', PaymentAllocationSchema);
