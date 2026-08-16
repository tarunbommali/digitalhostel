const Room = require('../models/Room');
const Block = require('../models/Block');
const BedAllocation = require('../models/BedAllocation');
const Student = require('../models/Student');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require('../utils/responseHelper');
const { withTransaction } = require('../utils/transactionHelper');
const AuditService = require('./auditService');

class RoomService {
  static async listBlocks(organizationId) {
    return Block.find({ organizationId, isActive: true }).sort({ name: 1 }).lean();
  }

  static async createBlock(organizationId, payload, actorUserId) {
    const { name, code, gender } = payload;
    if (!name) {
      throw new BadRequestError('Block name is required');
    }

    const existing = await Block.findOne({ organizationId, name: name.trim() });
    if (existing) {
      throw new ConflictError(`Block '${name}' already exists in this hostel`);
    }

    const block = await Block.create({
      organizationId,
      name: name.trim(),
      code: code ? code.trim() : name.slice(0, 3).toUpperCase(),
      gender: gender || 'boys',
      isActive: true,
    });

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'BLOCK_CREATED',
      'Block',
      block._id,
      { name: block.name }
    );

    return block;
  }

  static async listRooms(organizationId, query = {}) {
    const filter = { organizationId, isActive: true };
    if (query.hostelBlock) {
      filter.hostelBlock = query.hostelBlock;
    }
    if (query.status) {
      filter.status = query.status;
    }

    const rooms = await Room.find(filter).sort({ hostelBlock: 1, roomNumber: 1 }).lean();

    const roomIds = rooms.map((r) => r._id);
    const activeAllocations = await BedAllocation.find({
      organizationId,
      room: { $in: roomIds },
      isCurrent: true,
    })
      .populate('student', 'fullName hostelUid registrationNumber email')
      .lean();

    const allocMap = new Map();
    activeAllocations.forEach((a) => {
      const rId = a.room.toString();
      if (!allocMap.has(rId)) {
        allocMap.set(rId, []);
      }
      allocMap.get(rId).push(a);
    });

    return rooms.map((r) => {
      const occupants = allocMap.get(r._id.toString()) || [];
      return {
        ...r,
        currentOccupants: occupants.length,
        isOccupied: occupants.length >= r.capacity,
        occupants,
      };
    });
  }

  static async createRoom(organizationId, payload, actorUserId) {
    const { roomNumber, hostelBlock, capacity } = payload;
    if (!roomNumber || !hostelBlock || !capacity) {
      throw new BadRequestError('Room number, hostel block, and capacity are required');
    }

    const existing = await Room.findOne({
      organizationId,
      roomNumber: roomNumber.trim(),
      hostelBlock: hostelBlock.trim(),
    });

    if (existing) {
      throw new ConflictError(`Room ${roomNumber} in block ${hostelBlock} already exists`);
    }

    const room = await Room.create({
      organizationId,
      roomNumber: roomNumber.trim(),
      hostelBlock: hostelBlock.trim(),
      capacity: Number(capacity),
      currentOccupants: 0,
      isOccupied: false,
      status: 'active',
    });

    AuditService.recordAuditSafe(
      organizationId,
      actorUserId,
      'ROOM_CREATED',
      'Room',
      room._id,
      { roomNumber: room.roomNumber, block: room.hostelBlock }
    );

    return room;
  }

  static async getRoomById(organizationId, roomId) {
    const room = await Room.findOne({ _id: roomId, organizationId });
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const occupants = await BedAllocation.find({
      organizationId,
      room: room._id,
      isCurrent: true,
    }).populate('student', 'fullName hostelUid registrationNumber phoneNumber photoUrl');

    return {
      ...room.toJSON(),
      occupants,
    };
  }

  /**
   * Atomic bed allocation with transactionHelper
   */
  static async allocateBed(organizationId, studentId, roomId, bedNumber, actorUserId) {
    if (!studentId || !roomId || !bedNumber) {
      throw new BadRequestError('Student ID, Room ID, and bed number are required');
    }

    const cleanBed = bedNumber.trim();

    return withTransaction(async (session) => {
      const sessionOpts = session ? { session } : {};

      const student = await Student.findOne({ _id: studentId, organizationId }, null, sessionOpts);
      if (!student) {
        throw new NotFoundError('Student not found');
      }

      const room = await Room.findOne({ _id: roomId, organizationId, isActive: true }, null, sessionOpts);
      if (!room) {
        throw new NotFoundError('Target room not found or inactive');
      }

      // 1. Check bed slot collision
      const existingSlot = await BedAllocation.findOne({
        organizationId,
        room: room._id,
        bedNumber: cleanBed,
        isCurrent: true,
      }, null, sessionOpts);

      if (existingSlot) {
        throw new ConflictError(`Bed slot '${cleanBed}' in Room ${room.roomNumber} is already occupied.`);
      }

      // 2. Check room capacity atomic threshold
      const activeOccupantsCount = await BedAllocation.countDocuments({
        organizationId,
        room: room._id,
        isCurrent: true,
      }, sessionOpts);

      if (activeOccupantsCount >= room.capacity) {
        throw new BadRequestError(`Room ${room.roomNumber} capacity limit reached (${room.capacity} beds max)`);
      }

      // 3. Close student's existing active allocation (if transferring)
      const previousAllocations = await BedAllocation.find({
        organizationId,
        student: student._id,
        isCurrent: true,
      }, null, sessionOpts);

      for (const prev of previousAllocations) {
        prev.isCurrent = false;
        prev.allocatedTo = new Date();
        await prev.save(sessionOpts);
        await Room.findByIdAndUpdate(prev.room, { $inc: { currentOccupants: -1 } }, sessionOpts);
      }

      // 4. Create new active bed allocation
      const allocationDocs = await BedAllocation.create(
        [
          {
            organizationId,
            student: student._id,
            room: room._id,
            bedNumber: cleanBed,
            allocatedFrom: new Date(),
            isCurrent: true,
          },
        ],
        sessionOpts
      );
      const allocation = allocationDocs[0];

      // 5. Update target room counter
      const newOccupantCount = activeOccupantsCount + 1;
      await Room.findByIdAndUpdate(
        room._id,
        {
          currentOccupants: newOccupantCount,
          isOccupied: newOccupantCount >= room.capacity,
        },
        sessionOpts
      );

      AuditService.recordAuditSafe(
        organizationId,
        actorUserId,
        'BED_ALLOCATED',
        'BedAllocation',
        allocation._id,
        { student: student.fullName, room: room.roomNumber, bed: cleanBed }
      );

      return {
        allocation,
        student: { id: student._id, fullName: student.fullName, hostelUid: student.hostelUid },
        room: { id: room._id, roomNumber: room.roomNumber, hostelBlock: room.hostelBlock },
        bedNumber: cleanBed,
      };
    });
  }

  static async deallocateBed(organizationId, studentId, actorUserId) {
    return withTransaction(async (session) => {
      const sessionOpts = session ? { session } : {};

      const student = await Student.findOne({ _id: studentId, organizationId }, null, sessionOpts);
      if (!student) {
        throw new NotFoundError('Student not found');
      }

      const allocation = await BedAllocation.findOne({
        organizationId,
        student: student._id,
        isCurrent: true,
      }, null, sessionOpts);

      if (!allocation) {
        throw new NotFoundError('No active bed allocation found for this student');
      }

      allocation.isCurrent = false;
      allocation.allocatedTo = new Date();
      await allocation.save(sessionOpts);

      await Room.findByIdAndUpdate(
        allocation.room,
        {
          $inc: { currentOccupants: -1 },
          $set: { isOccupied: false },
        },
        sessionOpts
      );

      AuditService.recordAuditSafe(
        organizationId,
        actorUserId,
        'BED_DEALLOCATED',
        'BedAllocation',
        allocation._id,
        { student: student.fullName, room: allocation.room }
      );

      return { message: 'Bed deallocated successfully' };
    });
  }

  static async transferBed(organizationId, studentId, newRoomId, newBedNumber, actorUserId) {
    return this.allocateBed(organizationId, studentId, newRoomId, newBedNumber, actorUserId);
  }
}

module.exports = RoomService;
