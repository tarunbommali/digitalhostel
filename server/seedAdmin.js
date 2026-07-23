require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@hostel.edu";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin#123";
    const adminFirstName = process.env.ADMIN_FIRST_NAME || "Tarun";
    const adminLastName = process.env.ADMIN_LAST_NAME || "Bommali";
    const computedFull = `${adminFirstName} ${adminLastName}`.trim();

    let user = await User.findOne({ email: adminEmail.toLowerCase() });

    if (user) {
      console.log(`User ${adminEmail} already exists. Updating to Admin...`);
      user.role = "admin";
      user.password = adminPassword;
      user.firstName = adminFirstName;
      user.lastName = adminLastName;
      user.fullName = computedFull;
      user.isActive = true;
      await user.save();
      console.log(`Admin user ${adminEmail} updated successfully.`);
    } else {
      console.log(`Creating new admin user ${adminEmail}...`);
      user = new User({
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: "admin",
        firstName: adminFirstName,
        lastName: adminLastName,
        fullName: computedFull,
        isActive: true,
      });
      await user.save();
      console.log(`Admin user ${adminEmail} created successfully.`);
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
