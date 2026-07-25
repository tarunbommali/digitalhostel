const express = require("express");
const router = express.Router();
const Department = require("../models/Department");
const AcademicYear = require("../models/AcademicYear");
const Block = require("../models/Block");
const { authMiddleware, requireRole } = require("../middleware/auth");

// Blocks - GET
router.get("/blocks", authMiddleware, async (req, res) => {
  try {
    const list = await Block.find().sort({ name: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Blocks - POST
router.post(
  "/blocks",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { name, code, gender } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Block name is required" });
      }
      const validGenders = ["boys", "girls", "co-ed"];
      const targetGender = validGenders.includes(gender) ? gender : "boys";

      const existing = await Block.findOne({
        name: new RegExp(`^${name.trim()}$`, "i"),
      });
      if (existing) {
        return res.status(400).json({ error: "Hostel Block already exists" });
      }

      let blockCode = code ? code.trim().toUpperCase() : "";
      if (!blockCode) {
        const prefix = targetGender === "boys" ? "BH" : targetGender === "girls" ? "GH" : "CB";
        const count = await Block.countDocuments({ gender: targetGender });
        blockCode = `${prefix}-${count + 1}`;
      }

      const block = new Block({
        name: name.trim(),
        code: blockCode,
        gender: targetGender,
      });
      await block.save();
      res.status(201).json(block);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Blocks - DELETE
router.delete(
  "/blocks/:id",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      await Block.findByIdAndDelete(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Blocks - PUT (Edit Block Name, Code & Gender)
router.put(
  "/blocks/:id",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { name, code, gender } = req.body;
      const block = await Block.findById(req.params.id);
      if (!block) {
        return res.status(404).json({ error: "Hostel Block not found" });
      }

      const oldName = block.name;
      if (name && name.trim()) {
        const existing = await Block.findOne({
          _id: { $ne: block._id },
          name: new RegExp(`^${name.trim()}$`, "i"),
        });
        if (existing) {
          return res.status(400).json({ error: "Hostel Block with this name already exists" });
        }
        block.name = name.trim();
      }

      if (code !== undefined) block.code = code.trim().toUpperCase();
      if (gender && ["boys", "girls", "co-ed"].includes(gender.toLowerCase())) {
        block.gender = gender.toLowerCase();
      }

      await block.save();

      // Cascade update room hostelBlock name if block name changed
      if (oldName !== block.name) {
        const Room = require("../models/Room");
        await Room.updateMany({ hostelBlock: oldName }, { hostelBlock: block.name });
      }

      res.json({ ok: true, block });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Departments - GET
router.get("/departments", authMiddleware, async (req, res) => {
  try {
    const list = await Department.find().sort({ name: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Departments - POST
router.post(
  "/departments",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Department name is required" });
      }
      const existing = await Department.findOne({
        name: new RegExp(`^${name.trim()}$`, "i"),
      });
      if (existing) {
        return res.status(400).json({ error: "Department already exists" });
      }
      const dept = new Department({ name: name.trim() });
      await dept.save();
      res.status(201).json(dept);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Departments - DELETE
router.delete(
  "/departments/:id",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      await Department.findByIdAndDelete(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

const { processCompletedAcademicYears } = require("../services/academicYearService");

// Academic Years - GET
router.get("/academic-years", authMiddleware, async (req, res) => {
  try {
    await processCompletedAcademicYears();
    const list = await AcademicYear.find().sort({ name: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Academic Years - POST
router.post(
  "/academic-years",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const { name, isCurrent } = req.body;
    try {
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Academic year label is required" });
      }
      const existing = await AcademicYear.findOne({
        name: new RegExp(`^${name.trim()}$`, "i"),
      });
      if (existing) {
        return res.status(400).json({ error: "Academic year already exists" });
      }
      if (isCurrent) {
        await AcademicYear.updateMany({}, { isCurrent: false });
      }
      const year = new AcademicYear({ name: name.trim(), isCurrent: !!isCurrent });
      await year.save();
      await processCompletedAcademicYears();
      res.status(201).json(year);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Academic Years - PATCH Toggle Completed
router.patch(
  "/academic-years/:id/toggle-completed",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const year = await AcademicYear.findById(req.params.id);
      if (!year) return res.status(404).json({ error: "Academic year not found" });

      year.isCompleted = !year.isCompleted;
      if (year.isCompleted) {
        year.isCurrent = false;
      }
      await year.save();

      const result = await processCompletedAcademicYears();
      res.json({ ok: true, year, result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Academic Years - DELETE
router.delete(
  "/academic-years/:id",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      await AcademicYear.findByIdAndDelete(req.params.id);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Seed Default Departments, Academic Years & Hostel Blocks
router.post(
  "/seed-defaults",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const defaultDepts = [
        "Computer Science & Engineering",
        "Electronics & Communication Engineering",
        "Electrical & Electronics Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Information Technology",
      ];
      const defaultYears = ["2023-2027", "2024-2028", "2025-2029", "2026-2030"];
      const defaultBlocks = [
        { name: "Boys Hostel - Block A", gender: "boys" },
        { name: "Boys Hostel - Block B", gender: "boys" },
        { name: "Girls Hostel - Block A", gender: "girls" },
        { name: "Girls Hostel - Block B", gender: "girls" },
      ];

      let addedDepts = 0;
      let addedYears = 0;
      let addedBlocks = 0;

      for (const d of defaultDepts) {
        const exists = await Department.findOne({
          name: new RegExp(`^${d.trim()}$`, "i"),
        });
        if (!exists) {
          await new Department({ name: d }).save();
          addedDepts++;
        }
      }

      for (const y of defaultYears) {
        const exists = await AcademicYear.findOne({
          name: new RegExp(`^${y.trim()}$`, "i"),
        });
        if (!exists) {
          await new AcademicYear({ name: y }).save();
          addedYears++;
        }
      }

      for (const b of defaultBlocks) {
        const exists = await Block.findOne({
          name: new RegExp(`^${b.name.trim()}$`, "i"),
        });
        if (!exists) {
          await new Block({ name: b.name, gender: b.gender }).save();
          addedBlocks++;
        }
      }

      res.json({
        ok: true,
        message: `Seeded ${addedDepts} departments, ${addedYears} academic years, and ${addedBlocks} blocks.`,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;

