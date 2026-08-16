const mongoose = require('mongoose');

const AttendanceSessionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    attendanceDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
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

AttendanceSessionSchema.index(
  { organizationId: 1, attendanceDate: 1, mealType: 1 },
  { unique: true }
);

module.exports = mongoose.model('AttendanceSession', AttendanceSessionSchema);
