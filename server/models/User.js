const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "moderator", "student", "security_guard"],
      required: true,
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String },
    gender: { type: String, enum: ["male", "female", "other"], default: "male" },
    assignedGenderHostel: { type: String, enum: ["boys", "girls", "co-ed", "all"], default: "all" },
    moderatorType: {
      type: String,
      enum: [
        "administration",
        "discipline_monitor",
        "attendance_only",
        "security_guard",
        "full",
      ],
      default: "administration",
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Pre-save sync fullName and hash password
UserSchema.pre("save", async function (next) {
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ""} ${this.lastName || ""}`.trim();
  }

  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
