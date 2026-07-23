const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  hostelBlock: { type: String, required: true },
  capacity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Compound unique key for room + block
RoomSchema.index({ roomNumber: 1, hostelBlock: 1 }, { unique: true });

module.exports = mongoose.model("Room", RoomSchema);
