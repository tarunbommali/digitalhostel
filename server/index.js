require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;



// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/students"));
app.use("/api/moderators", require("./routes/moderators"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/leaves", require("./routes/leaves"));
app.use("/api/bills", require("./routes/bills"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/flags", require("./routes/flags"));
app.use("/api/lookups", require("./routes/lookups"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/audit-logs", require("./routes/logs"));
app.use("/api/outings", require("./routes/outings"));

// Error handling fallback
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});


const startServer = async () => {
  try {
    await connectDB();
    console.log("DB Connection Established");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Error: Port ${PORT} is already in use. Please terminate the process using port ${PORT} or set a different PORT in environment.`);
        process.exit(1);
      } else {
        console.error("Server error:", err);
      }
    });
  } catch (e) {
    console.error("Failed to start server:", e);
  }
};

startServer();