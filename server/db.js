const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI;
    await mongoose.connect(connUri);
    console.log("MongoDB Connected successfully.");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
};

module.exports = connectDB;
