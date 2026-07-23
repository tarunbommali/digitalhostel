const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AuditLog", AuditLogSchema);
