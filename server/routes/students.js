const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Student = require("../models/Student");
const Department = require("../models/Department");
const AcademicYear = require("../models/AcademicYear");
const AuditLog = require("../models/AuditLog");
const { authMiddleware, requireRole } = require("../middleware/auth");

const genHostelUid = (seqVal) => {
  return String(seqVal).padStart(6, "0");
};

const { processCompletedAcademicYears } = require("../services/academicYearService");

const MonthlyBill = require("../models/MonthlyBill");

// GET all students (with pagination, filters, sorting & dues)
router.get(
  "/",
  authMiddleware,
  requireRole(["admin", "moderator"]),
  async (req, res) => {
    try {
      await processCompletedAcademicYears();

      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 100;
      const { department, academicYear, programType, gender, dues, sortBy = "fullName", sortOrder = "asc", search } = req.query;

      // Calculate dues per student from MonthlyBill
      const duesAggregation = await MonthlyBill.aggregate([
        { $match: { remainingAmount: { $gt: 0 } } },
        { $group: { _id: "$student", totalDues: { $sum: "$remainingAmount" } } },
      ]);

      const duesMap = {};
      duesAggregation.forEach((item) => {
        duesMap[item._id.toString()] = item.totalDues;
      });

      // Build Mongoose Query
      const query = {};

      if (department) {
        query.department = department;
      }

      if (programType && ["UG", "PG"].includes(programType.toUpperCase())) {
        query.programType = programType.toUpperCase();
      }

      if (gender && ["boys", "girls", "co-ed"].includes(gender.toLowerCase())) {
        const BedAllocation = require("../models/BedAllocation");
        const Room = require("../models/Room");
        const Block = require("../models/Block");

        const targetBlocks = await Block.find({ gender: gender.toLowerCase() });
        const blockNames = targetBlocks.map((b) => b.name);
        const targetRooms = await Room.find({ hostelBlock: { $in: blockNames } });
        const roomIds = targetRooms.map((r) => r._id);
        const targetAllocations = await BedAllocation.find({
          room: { $in: roomIds },
          isCurrent: true,
        });
        const allocatedStudentIds = targetAllocations.map((a) => a.student);

        query.$or = [
          { gender: gender.toLowerCase() },
          { _id: { $in: allocatedStudentIds } },
        ];
      }

      if (academicYear) {
        const mongoose = require("mongoose");
        if (mongoose.Types.ObjectId.isValid(academicYear)) {
          query.academicYear = academicYear;
        } else {
          const yearDoc = await AcademicYear.findOne({
            name: new RegExp(`^${academicYear.trim()}$`, "i"),
          });
          if (yearDoc) {
            query.academicYear = yearDoc._id;
          }
        }
      }

      if (search && search.trim()) {
        const term = search.trim();
        const searchRegex = new RegExp(term, "i");
        query.$or = [
          { fullName: searchRegex },
          { registrationNumber: searchRegex },
          { hostelUid: searchRegex },
          { email: searchRegex },
        ];
      }

      let allStudents = await Student.find(query)
        .populate("department")
        .populate("academicYear")
        .populate("user", "isActive")
        .lean();

      // Attach totalDues to each student object
      allStudents = allStudents.map((s) => ({
        ...s,
        dues: duesMap[s._id.toString()] || 0,
      }));

      // Filter by dues if specified
      if (dues === "with_dues") {
        allStudents = allStudents.filter((s) => s.dues > 0);
      } else if (dues === "no_dues") {
        allStudents = allStudents.filter((s) => s.dues === 0);
      }

      // Sort students
      const dir = sortOrder === "desc" ? -1 : 1;
      allStudents.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === "department") {
          valA = a.department?.name || "";
          valB = b.department?.name || "";
        } else if (sortBy === "academicYear") {
          valA = a.academicYear?.name || "";
          valB = b.academicYear?.name || "";
        } else if (sortBy === "dues") {
          valA = a.dues || 0;
          valB = b.dues || 0;
        }

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });

      const total = allStudents.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedStudents = allStudents.slice(startIndex, startIndex + limit);

      res.json({
        students: paginatedStudents,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// POST single student creation
router.post("/", authMiddleware, requireRole(["admin", "moderator"]), async (req, res) => {
  if (req.user.role === "moderator" && req.user.moderatorType !== "administration" && req.user.moderatorType !== "full") {
    return res.status(403).json({ error: "Forbidden: Only Administration moderators can create students" });
  }

  const {
    email,
    password,
    firstName,
    lastName,
    fullName,
    phone,
    registrationNumber,
    programType,
    departmentId,
    academicYearId,
    dateJoined,
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Resolve sequence ID for hostelUid
    const lastStudent = await Student.findOne().sort({ createdAt: -1 });
    let lastUid = 100000;
    if (lastStudent && lastStudent.hostelUid) {
      lastUid = parseInt(lastStudent.hostelUid, 10);
    }
    const hostelUid = genHostelUid(lastUid + 1);

    // Calculate computed name fields
    const fName = firstName ? firstName.trim() : (fullName || "").split(" ")[0] || "";
    const lName = lastName ? lastName.trim() : (fullName || "").split(" ").slice(1).join(" ") || "";
    const computedFull = `${fName} ${lName}`.trim() || fullName || "Student";

    // Create user credentials (defaults to Password#123 if not specified)
    const userPassword = password && password.trim() ? password : "Password#123";
    const newUser = new User({
      email: email.toLowerCase(),
      password: userPassword,
      role: "student",
      firstName: fName,
      lastName: lName,
      fullName: computedFull,
      phone,
    });
    await newUser.save();

    // Create student profile
    const newStudent = new Student({
      user: newUser._id,
      hostelUid,
      registrationNumber,
      firstName: fName,
      lastName: lName,
      fullName: computedFull,
      email: email.toLowerCase(),
      phone,
      programType,
      department: departmentId,
      academicYear: academicYearId,
      dateJoined: new Date(),
      createdAt: new Date(),
    });
    await newStudent.save();

    // Create Audit Log
    const log = new AuditLog({
      user: req.user._id,
      action: "student.create",
      entityType: "student",
      entityId: newStudent._id.toString(),
      details: { hostelUid, email },
    });
    await log.save();

    res.status(201).json({ ok: true, student: newStudent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST bulk import students
router.post(
  "/bulk",
  authMiddleware,
  requireRole(["admin", "moderator"]),
  async (req, res) => {
    if (req.user.role === "moderator" && req.user.moderatorType !== "administration" && req.user.moderatorType !== "full") {
      return res.status(403).json({ error: "Forbidden: Only Administration moderators can import students" });
    }

    const { rows } = req.body;
    if (!rows || !Array.isArray(rows)) {
      return res
        .status(400)
        .json({ error: "Invalid bulk format. Expected array of rows" });
    }

    try {
      const depts = await Department.find();
      const years = await AcademicYear.find();
      const deptMap = new Map(depts.map((d) => [d.name.toLowerCase(), d._id]));
      const yearMap = new Map(years.map((y) => [y.name.toLowerCase(), y._id]));

      const results = [];
      let ok = 0;

      // Get baseline sequence
      const lastStudent = await Student.findOne().sort({ createdAt: -1 });
      let lastUid = 100000;
      if (lastStudent && lastStudent.hostelUid) {
        lastUid = parseInt(lastStudent.hostelUid, 10);
      }

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        try {
          const deptId = deptMap.get(r.departmentName.trim().toLowerCase());
          const yearId = yearMap.get(r.academicYearLabel.trim().toLowerCase());
          if (!deptId)
            throw new Error(`Unknown department: ${r.departmentName}`);
          if (!yearId)
            throw new Error(`Unknown academic year: ${r.academicYearLabel}`);

          const existing = await User.findOne({ email: r.email.toLowerCase() });
          if (existing) throw new Error(`Email ${r.email} already in use`);

          lastUid++;
          const hostelUid = genHostelUid(lastUid);
          const userPassword = r.password && String(r.password).trim() ? String(r.password).trim() : "Password#123";

          const fName = r.firstName ? String(r.firstName).trim() : String(r.fullName || "").split(" ")[0] || "";
          const lName = r.lastName ? String(r.lastName).trim() : String(r.fullName || "").split(" ").slice(1).join(" ") || "";
          const computedFull = `${fName} ${lName}`.trim() || r.fullName || "Student";

          const newUser = new User({
            email: r.email.toLowerCase(),
            password: userPassword,
            role: "student",
            firstName: fName,
            lastName: lName,
            fullName: computedFull,
          });
          await newUser.save();

          const newStudent = new Student({
            user: newUser._id,
            hostelUid,
            registrationNumber: r.registrationNumber,
            firstName: fName,
            lastName: lName,
            fullName: computedFull,
            email: r.email.toLowerCase(),
            programType: r.programType,
            department: deptId,
            academicYear: yearId,
          });
          await newStudent.save();

          results.push({ row: i + 1, ok: true, hostelUid });
          ok++;
        } catch (e) {
          results.push({ row: i + 1, ok: false, error: e.message });
        }
      }

      const log = new AuditLog({
        user: req.user._id,
        action: "student.bulk_import",
        entityType: "student",
        details: {
          total: rows.length,
          succeeded: ok,
          failed: rows.length - ok,
        },
      });
      await log.save();

      res.json({ ok: true, total: rows.length, succeeded: ok, results });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// PUT update status (Disable/Enable Student Profile)
router.put(
  "/:id/status",
  authMiddleware,
  requireRole(["admin"]),
  async (req, res) => {
    const { active } = req.body;
    try {
      const student = await Student.findById(req.params.id);
      if (!student) return res.status(404).json({ error: "Student not found" });

      await User.findByIdAndUpdate(student.user, { isActive: active });

      const log = new AuditLog({
        user: req.user._id,
        action: active ? "user.enable" : "user.disable",
        entityType: "student",
        entityId: student._id.toString(),
        details: { active },
      });
      await log.save();

      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// PUT update full student profile details (Admin / Moderator)
router.put(
  "/:id",
  authMiddleware,
  requireRole(["admin", "moderator"]),
  async (req, res) => {
    const {
      firstName,
      lastName,
      fullName,
      registrationNumber,
      email,
      phone,
      programType,
      departmentId,
      academicYearId,
      status,
    } = req.body;

    try {
      const student = await Student.findById(req.params.id);
      if (!student) return res.status(404).json({ error: "Student not found" });

      if (firstName) student.firstName = firstName.trim();
      if (lastName) student.lastName = lastName.trim();
      if (firstName || lastName) {
        student.fullName = `${student.firstName || ""} ${student.lastName || ""}`.trim();
      } else if (fullName) {
        student.fullName = fullName;
      }

      if (registrationNumber) student.registrationNumber = registrationNumber;
      if (email) student.email = email.toLowerCase();
      if (phone !== undefined) student.phone = phone;
      if (programType) student.programType = programType;
      if (departmentId) student.department = departmentId;
      if (academicYearId) student.academicYear = academicYearId;
      if (status) student.status = status;

      await student.save();

      // Update underlying User record
      const userUpdates = {};
      if (student.firstName) userUpdates.firstName = student.firstName;
      if (student.lastName) userUpdates.lastName = student.lastName;
      userUpdates.fullName = student.fullName;
      if (email) userUpdates.email = email.toLowerCase();
      if (phone !== undefined) userUpdates.phone = phone;

      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(student.user, userUpdates);
      }

      const log = new AuditLog({
        user: req.user._id,
        action: "student.update",
        entityType: "student",
        entityId: student._id.toString(),
        details: { fullName, registrationNumber, email },
      });
      await log.save();

      res.json({ ok: true, student });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

module.exports = router;
