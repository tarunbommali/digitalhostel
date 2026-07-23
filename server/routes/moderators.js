const express = require("express");
const router = express.Router();
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET moderators
router.get("/", authMiddleware, requireRole(["admin"]), async (req, res) => {
  try {
    const moderators = await User.find({ role: "moderator" }).select("-password");
    res.json(moderators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create moderator with specific privilege level & gender hostel attachment
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

    const validTypes = ["administration", "discipline_monitor", "attendance_only"];
    let type = validTypes.includes(moderatorType) ? moderatorType : "administration";
    if (moderatorType === "full") type = "administration";

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
      role: "moderator",
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
      entityType: "moderator",
      entityId: newMod._id.toString(),
      details: { email, moderatorType: type, gender: modGender, assignedGenderHostel },
    });
    await log.save();

    res.status(201).json({ ok: true, id: newMod._id, user: newMod });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update moderator status (supports both /:id/status and /:id/active)
router.put(
  ["/:id/status", "/:id/active"],
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const { active } = req.body;
    try {
      const user = await User.findById(req.params.id);
      if (!user || user.role !== "moderator") {
        return res.status(404).json({ error: "Moderator not found" });
      }

      user.isActive = !!active;
      await user.save();

      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
