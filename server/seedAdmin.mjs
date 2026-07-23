import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
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
    enum: ["admin", "moderator", "student"],
    required: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, require: true },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const seedAdmin = async () => {
  try {
    const connUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/hostel_db";
    await mongoose.connect(connUri);
    console.log("Connected to MongoDB successfully.");

    const adminEmail = "tarunbommali2810@gmail.com";
    const adminPassword = "Bommali@2001";
    const adminFullName = "Tarun Bommali";

    let user = await User.findOne({ email: adminEmail.toLowerCase() });

    if (user) {
      console.log(`User ${adminEmail} already exists. Updating to Admin...`);
      user.role = "admin";
      user.password = adminPassword;
      user.fullName = adminFullName;
      user.isActive = true;
      await user.save();
      console.log(`SUCCESS: Admin user ${adminEmail} updated successfully.`);
    } else {
      console.log(`Creating new admin user ${adminEmail}...`);
      user = new User({
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: "admin",
        fullName: adminFullName,
        isActive: true,
      });
      await user.save();
      console.log(`SUCCESS: Admin user ${adminEmail} created successfully.`);
    }
  } catch (err) {
    console.error("Error seeding admin user:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
};

seedAdmin();
