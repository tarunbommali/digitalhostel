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

  /* =========================================================================
     DEPARTMENTS
     ========================================================================= */
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

  /* =========================================================================
     ACADEMIC YEARS
     ========================================================================= */
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

  /* =========================================================================
     HOSTEL BLOCKS
     ========================================================================= */
  static async listBlocks(organizationId) {
    return Block.find({ organizationId, isActive: true }).sort({ name: 1 }).lean();
  }

  static async createBlock(organizationId, payload) {
    const { name, code, gender, description } = payload;
    if (!name) {
      throw new BadRequestError('Block name is required');
    }

    const existing = await Block.findOne({ organizationId, name: name.trim() });
    if (existing) {
      throw new ConflictError(`Hostel block '${name}' already exists`);
    }

    return Block.create({
      organizationId,
      name: name.trim(),
      code: code ? code.trim() : name.slice(0, 3).toUpperCase(),
      gender: gender || 'boys',
      description: description ? description.trim() : '',
      isActive: true,
    });
  }

  static async updateBlock(organizationId, blockId, payload) {
    const block = await Block.findOne({ _id: blockId, organizationId });
    if (!block) {
      throw new NotFoundError('Hostel block not found');
    }

    if (payload.name) block.name = payload.name.trim();
    if (payload.code) block.code = payload.code.trim();
    if (payload.gender) block.gender = payload.gender;
    if (payload.description !== undefined) block.description = payload.description.trim();
    if (payload.isActive !== undefined) block.isActive = payload.isActive;

    await block.save();
    return block;
  }

  static async deleteBlock(organizationId, blockId) {
    const block = await Block.findOne({ _id: blockId, organizationId });
    if (!block) {
      throw new NotFoundError('Hostel block not found');
    }

    // Check if any rooms exist in this block
    const roomsInBlock = await Room.countDocuments({ organizationId, hostelBlock: block.name });
    if (roomsInBlock > 0) {
      throw new ConflictError(`Cannot delete block '${block.name}' because ${roomsInBlock} rooms are assigned to it.`);
    }

    await Block.deleteOne({ _id: blockId, organizationId });
    return { ok: true, message: 'Hostel block deleted successfully' };
  }
}

module.exports = LookupService;
