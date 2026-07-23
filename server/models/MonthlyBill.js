const mongoose = require("mongoose");

const MonthlyBillSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, required: true },
  billMonth: { type: Number, required: true }, // 1 to 12
  billYear: { type: Number, required: true },
  genderTarget: {
    type: String,
    enum: ["all", "boys", "girls"],
    default: "all",
  },
  status: {
    type: String,
    enum: ["unpaid", "partially_paid", "paid"],
    default: "unpaid",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  verifiedAt: { type: Date },
  description: { type: String },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to prevent duplicate monthly bills for same student, month, year
MonthlyBillSchema.index(
  { student: 1, billMonth: 1, billYear: 1 },
  { unique: true },
);

module.exports = mongoose.model("MonthlyBill", MonthlyBillSchema);
