const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["sbi_collect"],
    default: "sbi_collect",
    required: true,
  },
  referenceId: {
    type: String,
    required: true,
    trim: true,
  },
  paymentDate: { type: Date, default: Date.now },
  remarks: { type: String },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", PaymentSchema);
