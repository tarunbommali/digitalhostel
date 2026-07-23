const mongoose = require("mongoose");

const BedAllocationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  bedNumber: { type: String, required: true },
  allocatedFrom: { type: Date, default: Date.now },
  allocatedTo: { type: Date },
  isCurrent: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BedAllocation", BedAllocationSchema);
