const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const LeaveRequest = require("../models/LeaveRequest");
const OutingLog = require("../models/OutingLog");
const AuditLog = require("../models/AuditLog");
const { authMiddleware, requireRole } = require("../middleware/auth");

// POST /api/outings/verify-scan
// Scan QR code token or query student details by Reg No / Hostel UID
router.post(
  "/verify-scan",
  authMiddleware,
  requireRole(["admin", "moderator", "security_guard"]),
  async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "No code or student ID provided" });
      }

      let hostelUid = code.trim();
      let regNo = code.trim();

      // Check if it's encoded JNTUGV-PASS format
      if (code.startsWith("JNTUGV-PASS::")) {
        try {
          const b64 = code.replace("JNTUGV-PASS::", "");
          const decodedStr = Buffer.from(b64, "base64").toString("utf-8");
          const payload = JSON.parse(decodedStr);
          if (payload.hUid) hostelUid = payload.hUid;
          if (payload.regNo) regNo = payload.regNo;
        } catch {
          // Fallback to raw string search
        }
      }

      const student = await Student.findOne({
        $or: [
          { hostelUid: hostelUid },
          { registrationNumber: regNo },
          { registrationNumber: { $regex: new RegExp(`^${regNo}$`, "i") } },
        ],
      })
        .populate("department", "name code")
        .populate("academicYear", "name");

      if (!student) {
        return res.status(404).json({ error: "Student Digital ID card not found" });
      }

      // Find current active approved leave if any
      const now = new Date();
      const activeLeave = await LeaveRequest.findOne({
        student: student._id,
        status: "approved",
        fromDate: { $lte: now },
        toDate: { $gte: now },
      });

      // Find recent outing log to determine current location state
      const lastOuting = await OutingLog.findOne({ student: student._id })
        .sort({ timestamp: -1 });

      const isCurrentlyOut = lastOuting ? lastOuting.type === "out" : false;

      res.json({
        ok: true,
        student,
        activeLeave: activeLeave || null,
        isCurrentlyOut,
        lastOuting: lastOuting || null,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/outings/record
// Security Guard records OUT or IN movement for student
router.post(
  "/record",
  authMiddleware,
  requireRole(["admin", "moderator", "security_guard"]),
  async (req, res) => {
    try {
      const { studentId, type, purpose, remarks } = req.body;
      if (!studentId || !["out", "in"].includes(type)) {
        return res.status(400).json({ error: "Invalid student ID or movement type" });
      }

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Check if student is active
      if (student.status !== "active") {
        return res.status(400).json({
          error: `Student status is ${student.status.toUpperCase()}. Gate movement restricted.`,
        });
      }

      // Find active leave request if available
      const now = new Date();
      const activeLeave = await LeaveRequest.findOne({
        student: student._id,
        status: "approved",
        fromDate: { $lte: now },
        toDate: { $gte: now },
      });

      const outingLog = new OutingLog({
        student: student._id,
        guard: req.user._id,
        type,
        leaveRequest: activeLeave ? activeLeave._id : undefined,
        status: type === "out" ? "approved_exit" : "approved_entry",
        purpose: purpose || (activeLeave ? activeLeave.reason : "General Outing"),
        remarks,
        timestamp: new Date(),
      });

      await outingLog.save();

      // Log in AuditLog
      const audit = new AuditLog({
        user: req.user._id,
        action: `outing.${type}`,
        entityType: "outing_log",
        entityId: outingLog._id.toString(),
        details: {
          studentUid: student.hostelUid,
          studentName: student.fullName,
          movement: type,
        },
      });
      await audit.save();

      res.status(201).json({
        ok: true,
        message: `Student successfully checked ${type.toUpperCase()}`,
        outingLog,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/outings/logbook
// Fetch overall logbook entries for security guards and staff
router.get(
  "/logbook",
  authMiddleware,
  requireRole(["admin", "moderator", "security_guard"]),
  async (req, res) => {
    try {
      const logs = await OutingLog.find()
        .populate({
          path: "student",
          select: "fullName hostelUid registrationNumber phone gender department",
          populate: { path: "department", select: "name code" },
        })
        .populate("guard", "fullName role")
        .sort({ timestamp: -1 })
        .limit(500);

      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/outings/my-status
// Fetch current outing status & history for logged-in student
router.get(
  "/my-status",
  authMiddleware,
  requireRole(["student"]),
  async (req, res) => {
    try {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({ error: "Student profile not found" });
      }

      const logs = await OutingLog.find({ student: student._id })
        .populate("guard", "fullName")
        .sort({ timestamp: -1 })
        .limit(20);

      const lastLog = logs[0];
      const isCurrentlyOut = lastLog ? lastLog.type === "out" : false;

      res.json({
        isCurrentlyOut,
        lastLog: lastLog || null,
        history: logs,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
