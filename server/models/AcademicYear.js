const mongoose = require("mongoose");

const AcademicYearSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  isCurrent: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  endYear: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AcademicYear", AcademicYearSchema);
