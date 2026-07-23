const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const BedAllocation = require("../models/BedAllocation");
const AttendanceSession = require("../models/AttendanceSession");
const AttendanceRecord = require("../models/AttendanceRecord");
const MonthlyBill = require("../models/MonthlyBill");
const LeaveRequest = require("../models/LeaveRequest");
const FlagReport = require("../models/FlagReport");
const { authMiddleware } = require("../middleware/auth");

// GET stats/dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const today = new Date(todayStr);

    if (req.user.role === "admin") {
      const totalStudents = await Student.countDocuments();
      const activeStudents = await Student.countDocuments({ status: "active" });
      const allocatedBeds = await BedAllocation.countDocuments({
        isCurrent: true,
      });

      // Attendance records today
      const sessionsToday = await AttendanceSession.find({
        attendanceDate: todayStr,
      });
      const attendance = { breakfast: 0, lunch: 0, dinner: 0 };
      for (const s of sessionsToday) {
        attendance[s.mealType] = await AttendanceRecord.countDocuments({
          session: s._id,
        });
      }

      // Bills dues
      const unpaidBills = await MonthlyBill.find({ status: { $ne: "paid" } });
      const dueAmount = unpaidBills.reduce(
        (sum, b) => sum + b.remainingAmount,
        0,
      );
      const dueStudents = new Set(unpaidBills.map((b) => b.student.toString()))
        .size;

      // Leaves today
      const leaves = await LeaveRequest.countDocuments({
        status: "approved",
        fromDate: { $lte: today },
        toDate: { $gte: today },
      });

      // Flags active
      const activeFlags = await FlagReport.countDocuments({
        status: { $ne: "resolved" },
      });
      const flaggedStudents = await FlagReport.distinct("student", {
        status: { $ne: "resolved" },
      });

      return res.json({
        totalStudents,
        activeStudents,
        allocatedBeds,
        breakfast: attendance.breakfast,
        lunch: attendance.lunch,
        dinner: attendance.dinner,
        dueStudents,
        dueAmount,
        onLeave: leaves,
        flagged: flaggedStudents.length,
        openFlags: activeFlags,
      });
    }

    if (req.user.role === "moderator") {
      const students = await Student.countDocuments();

      // Attendance records today
      const sessionsToday = await AttendanceSession.find({
        attendanceDate: todayStr,
      });
      const attendance = { breakfast: 0, lunch: 0, dinner: 0 };
      for (const s of sessionsToday) {
        attendance[s.mealType] = await AttendanceRecord.countDocuments({
          session: s._id,
        });
      }

      const pendingLeaves = await LeaveRequest.countDocuments({
        status: "pending",
      });
      const openFlags = await FlagReport.countDocuments({ status: "open" });

      return res.json({
        students,
        breakfast: attendance.breakfast,
        lunch: attendance.lunch,
        dinner: attendance.dinner,
        pendingLeaves,
        openFlags,
      });
    }

    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user._id })
        .populate("department")
        .populate("academicYear");
      if (!student)
        return res.status(404).json({ error: "Student profile not found" });

      const bills = await MonthlyBill.find({ student: student._id });
      const totalDue = bills.reduce((sum, b) => sum + b.remainingAmount, 0);
      const totalPaid = bills.reduce((sum, b) => sum + b.paidAmount, 0);

      const activeFlags = await FlagReport.countDocuments({
        student: student._id,
        status: { $ne: "resolved" },
      });
      const allocation = await BedAllocation.findOne({
        student: student._id,
        isCurrent: true,
      }).populate("room");

      return res.json({
        stu: student,
        totalDue,
        totalPaid,
        activeFlags,
        bed: allocation
          ? {
              bedNumber: allocation.bedNumber,
              rooms: {
                roomNumber: allocation.room?.roomNumber,
                hostelBlocks: { name: allocation.room?.hostelBlock },
              },
            }
          : null,
      });
    }

    res.status(400).json({ error: "Invalid role" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
