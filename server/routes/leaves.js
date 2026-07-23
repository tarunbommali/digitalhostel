const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const LeaveRequest = require("../models/LeaveRequest");
const AuditLog = require("../models/AuditLog");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET leaves list
router.get("/", authMiddleware, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user._id });
      if (!student)
        return res.status(404).json({ error: "Student profile not found" });
      filter = { student: student._id };
    }

    const leaves = await LeaveRequest.find(filter)
      .populate("student", "fullName hostelUid registrationNumber")
      .populate("approvedBy", "fullName")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST submit leave request (Student)
router.post(
  "/request",
  authMiddleware,
  requireRole(["student"]),
  async (req, res) => {
    const { fromDate, toDate, reason } = req.body;
    try {
      const student = await Student.findOne({ user: req.user._id });
      if (!student)
        return res.status(404).json({ error: "Student profile not found" });

      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return res.status(400).json({ error: "Invalid dates provided" });
      }

      if (to < from) {
        return res
          .status(400)
          .json({ error: "End date cannot be before start date" });
      }

      // Days count calculation (inclusive)
      const daysCount =
        Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;

      const leave = new LeaveRequest({
        student: student._id,
        fromDate: from,
        toDate: to,
        daysCount,
        reason,
      });
      await leave.save();

      res.status(201).json({ ok: true, leave });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// POST approve/reject leave (Staff only: Admin or Moderator)
router.post(
  "/decide",
  authMiddleware,
  requireRole(["admin", "moderator"]),
  async (req, res) => {
    const { leaveId, action } = req.body; // action: "approve" | "reject"
    try {
      const leave = await LeaveRequest.findById(leaveId).populate("student");
      if (!leave)
        return res.status(404).json({ error: "Leave request not found" });
      if (leave.status !== "pending")
        return res.status(400).json({ error: "Request already decided" });

      // Validate permission limits (Moderator can approve only <= 10 days)
      if (req.user.role === "moderator" && leave.daysCount > 10) {
        return res.status(403).json({
          error: "Leaves exceeding 10 days require administrator approval",
        });
      }

      leave.status = action === "approve" ? "approved" : "rejected";
      leave.approvedBy = req.user._id;
      leave.approvedAt = new Date();
      await leave.save();

      const log = new AuditLog({
        user: req.user._id,
        action: `leave.${action}`,
        entityType: "leave_request",
        entityId: leave._id.toString(),
        details: {
          daysCount: leave.daysCount,
          studentUid: leave.student?.hostelUid,
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
