const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const FlagReport = require("../models/FlagReport");
const AuditLog = require("../models/AuditLog");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET flags
router.get("/", authMiddleware, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user._id });
      if (!student)
        return res.status(404).json({ error: "Student profile not found" });
      filter = { student: student._id };
    }

    const flags = await FlagReport.find(filter)
      .populate("student", "fullName hostelUid registrationNumber")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST raise flag
router.post("/", authMiddleware, async (req, res) => {
  const { studentId, flagType, description } = req.body;
  try {
    let sid = studentId;
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user._id });
      if (!student)
        return res.status(404).json({ error: "Student profile not found" });
      sid = student._id;
    }

    const flag = new FlagReport({
      student: sid,
      flagType,
      description,
      createdBy: req.user._id,
    });
    await flag.save();

    res.status(201).json({ ok: true, flag });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT resolve flag
router.put(
  "/:id/resolve",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const flag = await FlagReport.findById(req.params.id).populate("student");
      if (!flag)
        return res.status(404).json({ error: "Flag report not found" });

      flag.status = "resolved";
      await flag.save();

      const log = new AuditLog({
        user: req.user._id,
        action: "flag.resolve",
        entityType: "flag_report",
        entityId: flag._id.toString(),
        details: {
          studentUid: flag.student?.hostelUid,
          flagType: flag.flagType,
        },
      });
      await log.save();

      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
