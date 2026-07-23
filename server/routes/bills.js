const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const MonthlyBill = require("../models/MonthlyBill");
const BedAllocation = require("../models/BedAllocation");
const Room = require("../models/Room");
const Block = require("../models/Block");
const AuditLog = require("../models/AuditLog");
const { authMiddleware, requireRole } = require("../middleware/auth");

async function getTargetStudents(genderTarget) {
  const activeStudents = await Student.find({ status: "active" });
  if (!genderTarget || genderTarget === "all") return activeStudents;

  // Find blocks matching target gender ("boys" or "girls")
  const targetBlocks = await Block.find({ gender: genderTarget });
  const blockNames = targetBlocks.map((b) => b.name);

  // Find rooms in matching blocks
  const targetRooms = await Room.find({ hostelBlock: { $in: blockNames } });
  const roomIds = targetRooms.map((r) => r._id);

  // Find current active bed allocations in those rooms
  const targetAllocations = await BedAllocation.find({
    room: { $in: roomIds },
    isCurrent: true,
  });
  const allocatedStudentIds = new Set(
    targetAllocations.map((a) => a.student.toString()),
  );

  return activeStudents.filter((s) => {
    if (s.gender === genderTarget) return true;
    return allocatedStudentIds.has(s._id.toString());
  });
}

// GET monthly bills
router.get("/", authMiddleware, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user._id });
      if (!student)
        return res.status(404).json({ error: "Student profile not found" });
      filter = { student: student._id, isVerified: true };
    }

    const bills = await MonthlyBill.find(filter)
      .populate("student", "fullName hostelUid registrationNumber")
      .populate("generatedBy", "fullName role")
      .populate("verifiedBy", "fullName")
      .sort({ billYear: -1, billMonth: -1, createdAt: -1 });

    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST publish monthly bill (all active students or targeted by gender)
router.post(
  "/publish",
  authMiddleware,
  requireRole(["admin", "moderator"]),
  async (req, res) => {
    if (req.user.role === "moderator" && req.user.moderatorType !== "administration" && req.user.moderatorType !== "full") {
      return res.status(403).json({ error: "Forbidden: Only Administration moderators can draft bills" });
    }

    const { month, year, amount, description, genderTarget = "all" } = req.body;

    try {
      const targetStudents = await getTargetStudents(genderTarget);
      if (!targetStudents || targetStudents.length === 0) {
        return res.json({ ok: true, count: 0 });
      }

      const isAdmin = req.user.role === "admin";
      let inserted = 0;

      for (const student of targetStudents) {
        try {
          const bill = new MonthlyBill({
            student: student._id,
            amount,
            remainingAmount: amount,
            billMonth: month,
            billYear: year,
            genderTarget,
            description,
            generatedBy: req.user._id,
            isVerified: isAdmin, // Admin auto-verifies; moderator bill requires admin verification
            verifiedBy: isAdmin ? req.user._id : undefined,
            verifiedAt: isAdmin ? new Date() : undefined,
          });
          await bill.save();
          inserted++;
        } catch (e) {
          // Skip duplicate errors
          if (e.code !== 11000) {
            throw e;
          }
        }
      }

      const log = new AuditLog({
        user: req.user._id,
        action: "bill.publish",
        entityType: "monthly_bill",
        details: {
          month,
          year,
          amount,
          genderTarget,
          generated: inserted,
          isVerified: isAdmin,
        },
      });
      await log.save();

      res.json({
        ok: true,
        count: inserted,
        isVerified: isAdmin,
        message: isAdmin
          ? `Generated & verified ${inserted} bills`
          : `Drafted ${inserted} bills for Admin verification`,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// PUT modify bill batch details before verification (Admin only)
router.put(
  "/update-batch",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const { month, year, genderTarget, newAmount, newDescription } = req.body;

    try {
      const filter = {
        billMonth: Number(month),
        billYear: Number(year),
      };
      if (genderTarget && genderTarget !== "all") {
        filter.genderTarget = genderTarget;
      }

      const billsToUpdate = await MonthlyBill.find(filter);
      let updatedCount = 0;

      for (const bill of billsToUpdate) {
        if (newAmount !== undefined && newAmount !== null) {
          bill.amount = Number(newAmount);
          bill.remainingAmount = Math.max(0, Number(newAmount) - bill.paidAmount);
          if (bill.remainingAmount === 0 && bill.amount > 0) {
            bill.status = "paid";
          } else if (bill.paidAmount > 0) {
            bill.status = "partially_paid";
          } else {
            bill.status = "unpaid";
          }
        }
        if (newDescription !== undefined) {
          bill.description = newDescription;
        }
        await bill.save();
        updatedCount++;
      }

      const log = new AuditLog({
        user: req.user._id,
        action: "bill.update_batch",
        entityType: "monthly_bill",
        details: { month, year, genderTarget, updatedCount, newAmount, newDescription },
      });
      await log.save();

      res.json({ ok: true, updatedCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// PUT verify bill batch by period (Admin only)
router.put(
  "/verify-period",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const { month, year, genderTarget } = req.body;

    try {
      const filter = {
        billMonth: Number(month),
        billYear: Number(year),
        isVerified: false,
      };
      if (genderTarget && genderTarget !== "all") {
        filter.genderTarget = genderTarget;
      }

      const result = await MonthlyBill.updateMany(filter, {
        $set: {
          isVerified: true,
          verifiedBy: req.user._id,
          verifiedAt: new Date(),
        },
      });

      const log = new AuditLog({
        user: req.user._id,
        action: "bill.verify",
        entityType: "monthly_bill",
        details: { month, year, genderTarget, verifiedCount: result.modifiedCount },
      });
      await log.save();

      res.json({ ok: true, verifiedCount: result.modifiedCount });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
