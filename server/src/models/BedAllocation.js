const mongoose = require('mongoose');

const BedAllocationSchema = new mongoose.Schema(
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
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    bedNumber: {
      type: String,
      required: true,
      trim: true,
    },
    allocatedFrom: {
      type: Date,
      default: Date.now,
    },
    allocatedTo: {
      type: Date,
    },
    isCurrent: {
      type: Boolean,
      default: true,
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

// Compound Unique Indexes for Active Allocations
BedAllocationSchema.index(
  { organizationId: 1, student: 1, isCurrent: 1 },
  { unique: true, partialFilterExpression: { isCurrent: true } }
);
BedAllocationSchema.index(
  { organizationId: 1, room: 1, bedNumber: 1, isCurrent: 1 },
  { unique: true, partialFilterExpression: { isCurrent: true } }
);
BedAllocationSchema.index({ organizationId: 1, room: 1, isCurrent: 1 });

module.exports = mongoose.model('BedAllocation', BedAllocationSchema);
