const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, trim: true }, // e.g. BH-1, GH-1, CB-1
  gender: {
    type: String,
    enum: ["boys", "girls", "co-ed"],
    default: "boys",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Block", BlockSchema);
