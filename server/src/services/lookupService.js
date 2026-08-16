const Department = require('../models/Department');
const AcademicYear = require('../models/AcademicYear');
const Block = require('../models/Block');
const Room = require('../models/Room');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require('../utils/responseHelper');

class LookupService {
  static async getAggregatedLookups(organizationId) {
    const [departments, academicYears, blocks, rooms] = await Promise.all([
      Department.find({ organizationId, isActive: true }).sort({ name: 1 }).lean(),
      AcademicYear.find({ organizationId, isActive: true }).sort({ name: -1 }).lean(),
      Block.find({ organizationId, isActive: true }).sort({ name: 1 }).lean(),
      Room.find({ organizationId, isActive: true }).sort({ hostelBlock: 1, roomNumber: 1 }).lean(),
    ]);

    return {
      departments,
      academicYears,
      blocks,
      rooms,
    };
  }

  static async createDepartment(organizationId, payload) {
    const { name, code } = payload;
    if (!name) {
      throw new BadRequestError('Department name is required');
    }

    const existing = await Department.findOne({ organizationId, name: name.trim() });
    if (existing) {
      throw new ConflictError(`Department '${name}' already exists`);
    }

    return Department.create({
      organizationId,
      name: name.trim(),
      code: code ? code.trim() : name.slice(0, 3).toUpperCase(),
      isActive: true,
    });
  }

  static async updateDepartment(organizationId, deptId, payload) {
    const dept = await Department.findOne({ _id: deptId, organizationId });
    if (!dept) {
      throw new NotFoundError('Department not found');
    }

    if (payload.name) dept.name = payload.name.trim();
    if (payload.code) dept.code = payload.code.trim();
    if (payload.isActive !== undefined) dept.isActive = payload.isActive;

    await dept.save();
    return dept;
  }

  static async deleteDepartment(organizationId, deptId) {
    const dept = await Department.findOne({ _id: deptId, organizationId });
    if (!dept) {
      throw new NotFoundError('Department not found');
    }

    await Department.deleteOne({ _id: deptId, organizationId });
    return { ok: true, message: 'Department deleted successfully' };
  }

  static async createAcademicYear(organizationId, payload) {
    const { name, isCurrent } = payload;
    if (!name) {
      throw new BadRequestError('Academic year name is required');
    }

    const existing = await AcademicYear.findOne({ organizationId, name: name.trim() });
    if (existing) {
      throw new ConflictError(`Academic year '${name}' already exists`);
    }

    if (isCurrent) {
      await AcademicYear.updateMany({ organizationId }, { isCurrent: false });
    }

    return AcademicYear.create({
      organizationId,
      name: name.trim(),
      isCurrent: !!isCurrent,
      isActive: true,
    });
  }

  static async updateAcademicYear(organizationId, yearId, payload) {
    const year = await AcademicYear.findOne({ _id: yearId, organizationId });
    if (!year) {
      throw new NotFoundError('Academic year not found');
    }

    if (payload.name) year.name = payload.name.trim();
    if (payload.isCurrent !== undefined) {
      if (payload.isCurrent) {
        await AcademicYear.updateMany({ organizationId }, { isCurrent: false });
      }
      year.isCurrent = payload.isCurrent;
    }
    if (payload.isActive !== undefined) year.isActive = payload.isActive;

    await year.save();
    return year;
  }

  static async deleteAcademicYear(organizationId, yearId) {
    const year = await AcademicYear.findOne({ _id: yearId, organizationId });
    if (!year) {
      throw new NotFoundError('Academic year not found');
    }

    await AcademicYear.deleteOne({ _id: yearId, organizationId });
    return { ok: true, message: 'Academic year deleted successfully' };
  }
}

module.exports = LookupService;
