const AttendanceService = require('../services/attendanceService');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');

const listSessions = async (req, res) => {
  const sessions = await AttendanceService.listSessions(req.organizationId, req.query.date);
  return sendSuccess(res, sessions, 'Sessions retrieved');
};

const createSession = async (req, res) => {
  const session = await AttendanceService.createSession(req.organizationId, req.body, req.user._id);
  return sendSuccess(res, session, 'Attendance session created', 201);
};

const markAttendance = async (req, res) => {
  const record = await AttendanceService.markAttendance(req.organizationId, req.body, req.user._id);
  return sendSuccess(res, record, 'Attendance marked successfully');
};

const bulkMark = async (req, res) => {
  const result = await AttendanceService.bulkMark(req.organizationId, req.body, req.user._id);
  return sendSuccess(res, result, 'Batch attendance marked');
};

const queryRecords = async (req, res) => {
  const { records, pagination } = await AttendanceService.queryRecords(req.organizationId, req.query);
  return sendPaginated(res, records, pagination, 'Attendance records retrieved');
};

const getStats = async (req, res) => {
  const stats = await AttendanceService.getStats(req.organizationId, req.query.date);
  return sendSuccess(res, stats, 'Attendance statistics retrieved');
};

module.exports = {
  listSessions,
  createSession,
  markAttendance,
  bulkMark,
  queryRecords,
  getStats,
};
