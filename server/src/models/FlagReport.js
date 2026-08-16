const mongoose = require('mongoose');

const FlagReportSchema = new mongoose.Schema(
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
    flagType: {
      type: String,
      enum: ['discipline', 'billing', 'attendance', 'other'],
      default: 'discipline',
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'reviewing', 'resolved'],
      default: 'open',
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

FlagReportSchema.index({ organizationId: 1, student: 1, createdAt: -1 });
FlagReportSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model('FlagReport', FlagReportSchema);
