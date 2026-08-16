const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      trim: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ organizationId: 1, action: 1 });
AuditLogSchema.index({ organizationId: 1, entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
