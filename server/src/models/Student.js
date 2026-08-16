const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: { type: String },
    hostelUid: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phoneNumber: { type: String, trim: true },
    phone: { type: String, trim: true },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'boys', 'girls', 'co-ed'],
      default: 'male',
    },
    programType: {
      type: String,
      enum: ['ug', 'pg', 'phd', 'UG', 'PG'],
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
    },
    yearOfStudy: { type: Number, min: 1, max: 5, default: 1 },
    status: {
      type: String,
      enum: ['active', 'suspended', 'graduated', 'transferred'],
      default: 'active',
      lowercase: true,
    },
    bloodGroup: { type: String, default: 'B+' },
    emergencyContact: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    photoUrl: { type: String },
    cardIssuedDate: { type: Date, default: Date.now },
    cardValidUntil: {
      type: Date,
      default: function () {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        return d;
      },
    },
    isHostelResident: { type: Boolean, default: true },
    attendanceEligibility: { type: Boolean, default: true },
    messStatus: {
      type: String,
      enum: ['active', 'suspended', 'cancelled'],
      default: 'active',
      lowercase: true,
    },
    joinedDate: { type: Date, default: Date.now },
    dateJoined: { type: Date, default: Date.now },
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

// Tenant-Scoped Compound Unique Indexes
StudentSchema.index({ organizationId: 1, hostelUid: 1 }, { unique: true });
StudentSchema.index({ organizationId: 1, registrationNumber: 1 }, { unique: true });
StudentSchema.index({ organizationId: 1, email: 1 }, { unique: true });
StudentSchema.index({ organizationId: 1, user: 1 }, { unique: true });
StudentSchema.index({ organizationId: 1, status: 1 });
StudentSchema.index({ organizationId: 1, department: 1, academicYear: 1 });

StudentSchema.pre('save', function (next) {
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.fullName;
  }
  if (this.phone && !this.phoneNumber) {
    this.phoneNumber = this.phone;
  } else if (this.phoneNumber && !this.phone) {
    this.phone = this.phoneNumber;
  }
  if (!this.studentId) {
    this.studentId = this.registrationNumber;
  }
  next();
});

module.exports = mongoose.model('Student', StudentSchema);
