require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db");
const User = require("./models/User");
const Department = require("./models/Department");
const AcademicYear = require("./models/AcademicYear");

const seedAdmin = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await connectDB();

    const adminEmail = "tarunbommali2810@gmail.com";
    const adminPassword = "Bommali@2001";
    const adminFullName = "Tarun Bommali";

    let user = await User.findOne({ email: adminEmail.toLowerCase() });

    if (user) {
      console.log(`Updating existing user ${adminEmail} to admin...`);
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

    // Seed default departments & academic years
    const defaultDepts = [
      "Computer Science & Engineering",
      "Electronics & Communication Engineering",
      "Electrical & Electronics Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Information Technology",
    ];
    const defaultYears = ["2023-2027", "2024-2028", "2025-2029", "2026-2030"];

    for (const name of defaultDepts) {
      const exists = await Department.findOne({ name });
      if (!exists) {
        await new Department({ name }).save();
        console.log(`Seeded Department: ${name}`);
      }
    }

    for (const name of defaultYears) {
      const exists = await AcademicYear.findOne({ name });
      if (!exists) {
        await new AcademicYear({ name }).save();
        console.log(`Seeded Academic Year: ${name}`);
      }
    }

    console.log("Database seeding completed successfully.");
  } catch (err) {
    console.error("Error seeding database:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
};

seedAdmin();
