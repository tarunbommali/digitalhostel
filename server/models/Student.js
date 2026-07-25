const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostelUid: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    email: { type: String, required: true },
    phone: { type: String },
    gender: { type: String, enum: ["boys", "girls", "co-ed"] },
    programType: { type: String, enum: ["UG", "PG"], required: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "graduated"],
      default: "active",
    },
    bloodGroup: { type: String, default: "B+" },
    emergencyContact: { type: String },
    guardianPhone: { type: String },
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
    dateJoined: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for fullName
StudentSchema.virtual("computedFullName").get(function () {
  return `${this.firstName || ""} ${this.lastName || ""}`.trim() || this.fullName;
});

// Sync fullName on save
StudentSchema.pre("save", function (next) {
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ""} ${this.lastName || ""}`.trim();
  }
  next();
});

module.exports = mongoose.model("Student", StudentSchema);
