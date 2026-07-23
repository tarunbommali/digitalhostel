const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Payment = require("../models/Payment");
const MonthlyBill = require("../models/MonthlyBill");
const PaymentAllocation = require("../models/PaymentAllocation");
const AuditLog = require("../models/AuditLog");
const { authMiddleware, requireRole } = require("../middleware/auth");

// GET payments list
router.get("/", authMiddleware, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user._id });
      if (!student)
        return res.status(404).json({ error: "Student profile not found" });
      filter = { student: student._id };
    }

    const payments = await Payment.find(filter)
      .populate("student", "fullName hostelUid registrationNumber")
      .populate("recordedBy", "fullName")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST record payment via SBI Collect reference ID
router.post(
  "/record",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const { studentId, amount, referenceId, paymentDate, remarks } = req.body;

    if (!referenceId || !referenceId.trim()) {
      return res
        .status(400)
        .json({ error: "SBI Collect Reference Payment ID is required" });
    }

    try {
      const payment = new Payment({
        student: studentId,
        amount,
        paymentMethod: "sbi_collect",
        referenceId: referenceId.trim(),
        paymentDate: paymentDate || new Date(),
        remarks,
        recordedBy: req.user._id,
      });
      await payment.save();

      // FIFO Allocation to oldest unpaid monthly bills
      let remaining = amount;
      const unpaidBills = await MonthlyBill.find({
        student: studentId,
        status: { $ne: "paid" },
      }).sort({ billYear: 1, billMonth: 1 }); // oldest first

      for (const bill of unpaidBills) {
        if (remaining <= 0) break;
        const remAmt = bill.remainingAmount;
        const allocAmt = Math.min(remaining, remAmt);

        if (allocAmt > 0) {
          // Create allocation record
          const allocation = new PaymentAllocation({
            payment: payment._id,
            bill: bill._id,
            allocatedAmount: allocAmt,
          });
          await allocation.save();

          // Update MonthlyBill details
          bill.paidAmount += allocAmt;
          bill.remainingAmount -= allocAmt;
          bill.status = bill.remainingAmount === 0 ? "paid" : "partially_paid";
          await bill.save();

          remaining -= allocAmt;
        }
      }

      const student = await Student.findById(studentId);
      const log = new AuditLog({
        user: req.user._id,
        action: "payment.record",
        entityType: "payment",
        entityId: payment._id.toString(),
        details: {
          studentUid: student?.hostelUid,
          amount,
          method: "sbi_collect",
          referenceId: referenceId.trim(),
        },
      });
      await log.save();

      res.json({ ok: true, paymentId: payment._id, unallocated: remaining });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
