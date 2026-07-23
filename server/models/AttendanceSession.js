const mongoose = require("mongoose");

const AttendanceSessionSchema = new mongoose.Schema({
  attendanceDate: { type: String, required: true }, // YYYY-MM-DD
  mealType: {
    type: String,
    enum: ["breakfast", "lunch", "dinner"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

AttendanceSessionSchema.index(
  { attendanceDate: 1, mealType: 1 },
  { unique: true },
);

module.exports = mongoose.model("AttendanceSession", AttendanceSessionSchema);
