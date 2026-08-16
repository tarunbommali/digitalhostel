const AcademicYear = require("../models/AcademicYear");
const Student = require("../models/Student");
const User = require("../models/User");
const BedAllocation = require("../models/BedAllocation");

/**
 * Parses four-digit years from batch name string (e.g. "2020-2024", "2024 Batch")
 */
function parseEndYear(name) {
  if (!name) return null;
  const matches = name.match(/\d{4}/g);
  if (!matches || matches.length === 0) return null;
  // Return the last 4-digit year found in the string
  return parseInt(matches[matches.length - 1], 10);
}

/**
 * Evaluates academic years, marks expired/completed ones,
 * automatically graduates assigned students, deactivates user accounts,
 * and releases active bed allocations.
 */
async function processCompletedAcademicYears() {
  try {
    const currentCalendarYear = new Date().getFullYear();
    const allYears = await AcademicYear.find();

    const completedYearIds = [];

    for (const yearDoc of allYears) {
      let isCompleted = yearDoc.isCompleted || false;
      const parsedYear = parseEndYear(yearDoc.name);

      if (parsedYear && !yearDoc.endYear) {
        yearDoc.endYear = parsedYear;
      }

      // Automatically mark as completed if batch end year has passed
      if (parsedYear && parsedYear < currentCalendarYear) {
        isCompleted = true;
      }

      if (isCompleted !== yearDoc.isCompleted || (parsedYear && !yearDoc.endYear)) {
        yearDoc.isCompleted = isCompleted;
        if (isCompleted) yearDoc.isCurrent = false;
        await yearDoc.save();
      }

      if (isCompleted) {
        completedYearIds.push(yearDoc._id);
      }
    }

    if (completedYearIds.length > 0) {
      // Find all active students in completed academic years
      const activeStudentsToComplete = await Student.find({
        academicYear: { $in: completedYearIds },
        status: { $ne: "graduated" },
      });

      for (const student of activeStudentsToComplete) {
        student.status = "graduated";
        await student.save();
        updatedStudents++;

        if (student.user) {
          await User.findByIdAndUpdate(student.user, { isActive: false });
        }

        const activeAllocations = await BedAllocation.find({
          student: student._id,
          isCurrent: true,
        });

        for (const alloc of activeAllocations) {
          alloc.isCurrent = false;
          alloc.allocatedTo = new Date();
          await alloc.save();
          releasedBeds++;
        }
      }
    }

    // Process annual card expiry (if cardValidUntil < now, automatically disable active card)
    const expiredCardStudents = await Student.find({
      cardValidUntil: { $lt: new Date() },
      status: "active",
    });

    for (const student of expiredCardStudents) {
      student.status = "suspended";
      await student.save();
      if (student.user) {
        await User.findByIdAndUpdate(student.user, { isActive: false });
      }
    }

    return { updatedStudents, releasedBeds, expiredCards: expiredCardStudents.length };
  } catch (err) {
    console.error("Error in processCompletedAcademicYears:", err);
    return { error: err.message };
  }
}

module.exports = {
  parseEndYear,
  processCompletedAcademicYears,
};
