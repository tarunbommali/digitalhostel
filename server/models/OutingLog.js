const mongoose = require("mongoose");

const OutingLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    guard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["out", "in"],
      required: true,
    },
    leaveRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveRequest",
    },
    status: {
      type: String,
      enum: ["approved_exit", "approved_entry", "manual_entry", "unauthorized_attempt"],
      default: "approved_exit",
    },
    purpose: { type: String, trim: true },
    remarks: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OutingLog", OutingLogSchema);
