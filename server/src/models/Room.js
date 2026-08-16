const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    hostelBlock: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },
    currentOccupants: {
      type: Number,
      default: 0,
      min: 0,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'inactive'],
      default: 'active',
      lowercase: true,
    },
    isActive: {
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

// Compound Unique Index on Room within Tenant & Block
RoomSchema.index({ organizationId: 1, roomNumber: 1, hostelBlock: 1 }, { unique: true });
RoomSchema.index({ organizationId: 1, hostelBlock: 1, isActive: 1 });
RoomSchema.index({ organizationId: 1, isOccupied: 1 });

module.exports = mongoose.model('Room', RoomSchema);
