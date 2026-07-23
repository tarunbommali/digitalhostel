const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const { authMiddleware } = require("../middleware/auth");

// Login Route (Supports login using Email OR Phone Number)
router.post("/login", async (req, res) => {
  const loginInput = String(req.body.email || req.body.phone || req.body.identifier || "").trim();
  const { password } = req.body;

  if (!loginInput || !password) {
    return res.status(400).json({ error: "Email or Phone Number and password are required" });
  }

  try {
    let user = null;
    if (loginInput.includes("@")) {
      user = await User.findOne({ email: loginInput.toLowerCase() });
    } else {
      const digitsOnly = loginInput.replace(/\D/g, "");
      const searchRegex = digitsOnly.length >= 7 ? new RegExp(digitsOnly.slice(-10)) : null;

      user = await User.findOne({
        $or: [
          { email: loginInput.toLowerCase() },
          ...(searchRegex ? [{ phone: searchRegex }] : [{ phone: loginInput }]),
        ],
      });

      // Fallback: check student phone record
      if (!user && searchRegex) {
        const student = await Student.findOne({ phone: searchRegex });
        if (student && student.user) {
          user = await User.findById(student.user);
        }
      }
    }

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ error: "Your account has been deactivated" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "7d",
      },
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        moderatorType: user.moderatorType || "full",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Current User (Me)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    let studentInfo = null;

    if (user.role === "student") {
      studentInfo = await Student.findOne({ user: user._id })
        .populate("department")
        .populate("academicYear");
    }

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
      moderatorType: user.moderatorType || "full",
      student: studentInfo,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed / Initial Admin Creation (KISS utility for setup)
router.post("/seed-admin", async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const admin = new User({
      email: email.toLowerCase(),
      password,
      role: "admin",
      fullName,
    });

    await admin.save();
    res.json({ ok: true, message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password Mock
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User with this email not found" });
    }
    res.json({ ok: true, message: "Password reset link sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change Password (Authenticated User)
router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current password and new password are required" });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "New password must be at least 8 characters long" });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    user.password = newPassword; // Pre-save hook hashes it
    await user.save();

    res.json({ ok: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
