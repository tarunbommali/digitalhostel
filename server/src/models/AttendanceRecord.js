const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    markedBy: {
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

// Compound Unique Index: A student can scan only once per session
AttendanceRecordSchema.index(
  { organizationId: 1, session: 1, student: 1 },
  { unique: true }
);
AttendanceRecordSchema.index({ organizationId: 1, student: 1, createdAt: -1 });

module.exports = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
