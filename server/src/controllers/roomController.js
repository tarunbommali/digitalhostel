const RoomService = require('../services/roomService');
const { sendSuccess } = require('../utils/responseHelper');

const listBlocks = async (req, res) => {
  const blocks = await RoomService.listBlocks(req.organizationId);
  return sendSuccess(res, blocks, 'Blocks retrieved');
};

const createBlock = async (req, res) => {
  const block = await RoomService.createBlock(req.organizationId, req.body, req.user._id);
  return sendSuccess(res, block, 'Hostel block created successfully', 201);
};

const listRooms = async (req, res) => {
  const rooms = await RoomService.listRooms(req.organizationId, req.query);
  return sendSuccess(res, rooms, 'Rooms retrieved successfully');
};

const createRoom = async (req, res) => {
  const room = await RoomService.createRoom(req.organizationId, req.body, req.user._id);
  return sendSuccess(res, room, 'Room created successfully', 201);
};

const getRoomById = async (req, res) => {
  const room = await RoomService.getRoomById(req.organizationId, req.params.id);
  return sendSuccess(res, room, 'Room details retrieved');
};

const allocateBed = async (req, res) => {
  const { studentId, roomId, bedNumber } = req.body;
  const targetRoomId = roomId || req.params.id;
  const result = await RoomService.allocateBed(req.organizationId, studentId, targetRoomId, bedNumber, req.user._id);
  return sendSuccess(res, result, 'Bed allocated successfully');
};

const deallocateBed = async (req, res) => {
  const { studentId } = req.body;
  const result = await RoomService.deallocateBed(req.organizationId, studentId, req.user._id);
  return sendSuccess(res, result, 'Bed deallocated successfully');
};

const transferBed = async (req, res) => {
  const { studentId, newRoomId, newBedNumber } = req.body;
  const result = await RoomService.transferBed(req.organizationId, studentId, newRoomId, newBedNumber, req.user._id);
  return sendSuccess(res, result, 'Student bed transferred successfully');
};

module.exports = {
  listBlocks,
  createBlock,
  listRooms,
  createRoom,
  getRoomById,
  allocateBed,
  deallocateBed,
  transferBed,
};
