const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET audit logs
router.get("/", authMiddleware, requireRole(["admin"]), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "fullName email role")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
