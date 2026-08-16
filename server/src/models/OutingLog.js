const mongoose = require('mongoose');

const OutingLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    guard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['in', 'out'],
      required: true,
      lowercase: true,
    },
    purpose: {
      type: String,
      default: 'Outing',
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['approved_exit', 'approved_entry', 'rejected', 'pending'],
      default: 'approved_exit',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
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

OutingLogSchema.index({ organizationId: 1, student: 1, timestamp: -1 });
OutingLogSchema.index({ organizationId: 1, type: 1, status: 1 });

module.exports = mongoose.model('OutingLog', OutingLogSchema);
