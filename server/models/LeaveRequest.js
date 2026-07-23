const mongoose = require("mongoose");

const LeaveRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  daysCount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LeaveRequest", LeaveRequestSchema);
