const mongoose = require("mongoose");

const AttendanceRecordSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AttendanceSession",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// Ensure a student has only one record per session
AttendanceRecordSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("AttendanceRecord", AttendanceRecordSchema);
