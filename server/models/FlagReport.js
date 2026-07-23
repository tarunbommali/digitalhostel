const mongoose = require("mongoose");

const FlagReportSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  flagType: {
    type: String,
    enum: ["discipline", "billing", "attendance", "other"],
    required: true,
  },
  description: { type: String },
  status: {
    type: String,
    enum: ["open", "reviewing", "resolved"],
    default: "open",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("FlagReport", FlagReportSchema);
