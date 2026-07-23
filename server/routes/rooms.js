const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const BedAllocation = require("../models/BedAllocation");
const Student = require("../models/Student");
const AuditLog = require("../models/AuditLog");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET all rooms with computed allocations
router.get("/", authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find();

    // Find all active allocations
    const allocations = await BedAllocation.find({ isCurrent: true }).populate(
      "student",
      "fullName registrationNumber hostelUid",
    );

    // Format response
    const formattedRooms = rooms.map((room) => {
      const roomAllocations = allocations.filter(
        (a) => a.room.toString() === room._id.toString(),
      );
      return {
        id: room._id,
        roomNumber: room.roomNumber,
        hostelBlock: room.hostelBlock,
        capacity: room.capacity,
        occupancy: roomAllocations.length,
        allocations: roomAllocations.map((a) => ({
          id: a._id,
          bedNumber: a.bedNumber,
          student: a.student,
        })),
      };
    });

    res.json(formattedRooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create room
router.post("/", authMiddleware, requireRole(["admin"]), async (req, res) => {
  const { roomNumber, hostelBlock, capacity } = req.body;
  try {
    const existing = await Room.findOne({ roomNumber, hostelBlock });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Room already exists in this block" });
    }

    const room = new Room({ roomNumber, hostelBlock, capacity });
    await room.save();
    res.status(201).json({ ok: true, room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST allocate bed
router.post(
  "/allocate",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const { studentId, roomId, bedNumber } = req.body;

    try {
      const room = await Room.findById(roomId);
      if (!room) return res.status(404).json({ error: "Room not found" });

      // Check if bed is already taken
      const existingAlloc = await BedAllocation.findOne({
        room: roomId,
        bedNumber,
        isCurrent: true,
      });
      if (existingAlloc) {
        return res.status(400).json({ error: "Bed already occupied" });
      }

      // Check if student already has active allocation
      const studentAlloc = await BedAllocation.findOne({
        student: studentId,
        isCurrent: true,
      });
      if (studentAlloc) {
        return res
          .status(400)
          .json({ error: "Student is already allocated a bed" });
      }

      // Check room capacity limit
      const activeAllocCount = await BedAllocation.countDocuments({
        room: roomId,
        isCurrent: true,
      });
      if (activeAllocCount >= room.capacity) {
        return res
          .status(400)
          .json({ error: "Room is already at full capacity" });
      }

      const allocation = new BedAllocation({
        student: studentId,
        room: roomId,
        bedNumber,
      });
      await allocation.save();

      const student = await Student.findById(studentId);
      const log = new AuditLog({
        user: req.user._id,
        action: "bed.allocate",
        entityType: "bed_allocation",
        entityId: allocation._id.toString(),
        details: {
          roomNumber: room.roomNumber,
          block: room.hostelBlock,
          bedNumber,
          studentUid: student?.hostelUid,
        },
      });
      await log.save();

      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// POST release allocation
router.post(
  "/release",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const { allocationId } = req.body;
    try {
      const allocation = await BedAllocation.findById(allocationId)
        .populate("room")
        .populate("student");
      if (!allocation || !allocation.isCurrent) {
        return res.status(404).json({ error: "Active allocation not found" });
      }

      allocation.isCurrent = false;
      allocation.allocatedTo = new Date();
      await allocation.save();

      const log = new AuditLog({
        user: req.user._id,
        action: "bed.release",
        entityType: "bed_allocation",
        entityId: allocation._id.toString(),
        details: {
          roomNumber: allocation.room?.roomNumber,
          block: allocation.room?.hostelBlock,
          bedNumber: allocation.bedNumber,
          studentUid: allocation.student?.hostelUid,
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
