const StudentService = require('../services/studentService');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');

const listStudents = async (req, res) => {
  const { students, pagination } = await StudentService.listStudents(req.organizationId, req.query);
  return sendPaginated(res, students, pagination, 'Students retrieved successfully');
};

const getStudentById = async (req, res) => {
  const student = await StudentService.getStudentById(req.organizationId, req.params.id, req.user);
  return sendSuccess(res, student, 'Student details retrieved');
};

const createStudent = async (req, res) => {
  const student = await StudentService.createStudent(req.organizationId, req.body, req.user._id);
  return sendSuccess(res, student, 'Student enrolled successfully', 201);
};

const updateStudent = async (req, res) => {
  const student = await StudentService.updateStudent(req.organizationId, req.params.id, req.body, req.user._id);
  return sendSuccess(res, student, 'Student details updated');
};

const updateStatus = async (req, res) => {
  const { status, active } = req.body;
  const targetStatus = status || (active !== undefined ? (active ? 'active' : 'suspended') : 'active');
  const student = await StudentService.updateStatus(req.organizationId, req.params.id, targetStatus, req.user._id);
  return sendSuccess(res, student, 'Student status updated successfully');
};

const renewPass = async (req, res) => {
  const result = await StudentService.renewPass(req.organizationId, req.params.id, req.user._id);
  return sendSuccess(res, result, 'Student pass renewed successfully');
};

const getStudentOverview = async (req, res) => {
  const overview = await StudentService.getStudentOverview(req.organizationId, req.params.id, req.user);
  return sendSuccess(res, overview, 'Student 360 overview retrieved');
};

const bulkImport = async (req, res) => {
  const rows = req.body.roster || req.body.rows || [];
  const result = await StudentService.bulkImport(req.organizationId, rows, req.user._id);
  return sendSuccess(res, result, 'Roster import completed');
};

module.exports = {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateStatus,
  renewPass,
  getStudentOverview,
  bulkImport,
};
