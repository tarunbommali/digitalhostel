const mongoose = require("mongoose");

const PaymentAllocationSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MonthlyBill",
    required: true,
  },
  allocatedAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PaymentAllocation", PaymentAllocationSchema);
