const express = require("express");
const router = express.Router();
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET moderators & staff
router.get("/", authMiddleware, requireRole(["admin"]), async (req, res) => {
  try {
    const moderators = await User.find({
      role: { $in: ["moderator", "security_guard"] },
    }).select("-password");
    res.json(moderators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create moderator or security guard with specific privilege level & gender hostel attachment
router.post("/", authMiddleware, requireRole(["admin"]), async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    fullName,
    phone,
    gender,
    moderatorType,
  } = req.body;

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const validTypes = [
      "administration",
      "discipline_monitor",
      "attendance_only",
      "security_guard",
    ];
    let type = validTypes.includes(moderatorType) ? moderatorType : "administration";
    if (moderatorType === "full") type = "administration";

    const userRole = type === "security_guard" ? "security_guard" : "moderator";

    const fName = firstName ? firstName.trim() : (fullName || "").split(" ")[0] || "";
    const lName = lastName ? lastName.trim() : (fullName || "").split(" ").slice(1).join(" ") || "";
    const computedFull = `${fName} ${lName}`.trim() || fullName || "Staff Member";

    // Set default password to Password#123 if omitted
    const userPassword = password && password.trim() ? password : "Password#123";

    // Gender attachment: male -> boys hostel; female -> girls hostel
    const modGender = gender && ["male", "female"].includes(gender) ? gender : "male";
    const assignedGenderHostel = modGender === "female" ? "girls" : "boys";

    const newMod = new User({
      email: email.toLowerCase(),
      password: userPassword,
      role: userRole,
      firstName: fName,
      lastName: lName,
      fullName: computedFull,
      phone,
      gender: modGender,
      assignedGenderHostel,
      moderatorType: type,
      createdAt: new Date(),
    });
    await newMod.save();

    const log = new AuditLog({
      user: req.user._id,
      action: "user.create",
      entityType: userRole,
      entityId: newMod._id.toString(),
      details: { email, moderatorType: type, gender: modGender, assignedGenderHostel },
    });
    await log.save();

    res.status(201).json({ ok: true, id: newMod._id, user: newMod });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update staff status
router.put(
  ["/:id/status", "/:id/active"],
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const { active } = req.body;
    try {
      const user = await User.findById(req.params.id);
      if (!user || !["moderator", "security_guard"].includes(user.role)) {
        return res.status(404).json({ error: "Staff member not found" });
      }

      user.isActive = !!active;
      await user.save();

      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// PUT update staff details (Name, Email, Phone, Gender, ModeratorType)
router.put(
  "/:id",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const {
      firstName,
      lastName,
      fullName,
      email,
      phone,
      gender,
      moderatorType,
      password,
    } = req.body;

    try {
      const user = await User.findById(req.params.id);
      if (!user || !["moderator", "security_guard"].includes(user.role)) {
        return res.status(404).json({ error: "Staff member not found" });
      }

      if (email && email.toLowerCase() !== user.email) {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
          return res.status(400).json({ error: "Email already in use" });
        }
        user.email = email.toLowerCase();
      }

      if (firstName) user.firstName = firstName.trim();
      if (lastName) user.lastName = lastName.trim();
      if (firstName || lastName) {
        user.fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      } else if (fullName) {
        user.fullName = fullName.trim();
      }

      if (phone !== undefined) user.phone = phone;

      if (gender && ["male", "female"].includes(gender)) {
        user.gender = gender;
        user.assignedGenderHostel = gender === "female" ? "girls" : "boys";
      }

      if (moderatorType) {
        const validTypes = [
          "administration",
          "discipline_monitor",
          "attendance_only",
          "security_guard",
        ];
        if (validTypes.includes(moderatorType)) {
          user.moderatorType = moderatorType;
          user.role = moderatorType === "security_guard" ? "security_guard" : "moderator";
        }
      }

      if (password && password.trim()) {
        user.password = password.trim(); // Pre-save hook hashes password
      }

      await user.save();

      const log = new AuditLog({
        user: req.user._id,
        action: "user.update",
        entityType: user.role,
        entityId: user._id.toString(),
        details: { email: user.email, moderatorType: user.moderatorType },
      });
      await log.save();

      res.json({ ok: true, user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
