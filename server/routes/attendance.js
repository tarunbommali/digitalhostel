const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET attendance stats for dashboard
router.get("/stats", authMiddleware, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const sessions = await AttendanceSession.find({ attendanceDate: today });
    const counts = { breakfast: 0, lunch: 0, dinner: 0 };

    for (const session of sessions) {
      const recCount = await AttendanceRecord.countDocuments({
        session: session._id,
      });
      counts[session.mealType] = recCount;
    }

    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST mark attendance
router.post(
  "/mark",
  authMiddleware,
  requireRole(["admin", "moderator"]),
  async (req, res) => {
    const { hostelUid, mealType, date } = req.body;
    const day = date || new Date().toISOString().slice(0, 10);

    try {
      const student = await Student.findOne({ hostelUid });
      if (!student) return res.status(404).json({ error: "Student not found" });
      if (student.status !== "active")
        return res
          .status(400)
          .json({ error: `Student is inactive (status: ${student.status})` });

      // Get or Create Session
      let session = await AttendanceSession.findOne({
        attendanceDate: day,
        mealType,
      });
      if (!session) {
        session = new AttendanceSession({ attendanceDate: day, mealType });
        await session.save();
      }

      // Check if record exists
      const recordExists = await AttendanceRecord.findOne({
        session: session._id,
        student: student._id,
      });
      if (recordExists) {
        return res.status(400).json({ error: "Already marked for this meal" });
      }

      const record = new AttendanceRecord({
        session: session._id,
        student: student._id,
        markedBy: req.user._id,
      });
      await record.save();

      res.json({ ok: true, student });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// GET attendance history for admin/moderator, or for logged-in student
router.get("/history", authMiddleware, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user._id });
      if (!student)
        return res.status(404).json({ error: "Student profile not found" });
      filter = { student: student._id };
    }

    const records = await AttendanceRecord.find(filter)
      .populate("student", "fullName hostelUid registrationNumber")
      .populate("session", "attendanceDate mealType")
      .populate("markedBy", "fullName")
      .sort({ createdAt: -1 })
      .limit(100);

    const formatted = records.map((r) => ({
      id: r._id,
      student: r.student,
      markedBy: r.markedBy?.fullName,
      date: r.session?.attendanceDate,
      mealType: r.session?.mealType,
      createdAt: r.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
