const LeaveService = require('../services/leaveService');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');

const listLeaves = async (req, res) => {
  const { leaves, pagination } = await LeaveService.listLeaves(req.organizationId, req.query, req.user);
  return sendPaginated(res, leaves, pagination, 'Leaves retrieved');
};

const submitLeave = async (req, res) => {
  const leave = await LeaveService.submitLeave(req.organizationId, req.body, req.user);
  return sendSuccess(res, leave, 'Leave request submitted successfully', 201);
};

const getLeaveById = async (req, res) => {
  const leave = await LeaveService.getLeaveById(req.organizationId, req.params.id, req.user);
  return sendSuccess(res, leave, 'Leave details retrieved');
};

const updateStatus = async (req, res) => {
  const { status, action, leaveId } = req.body;
  const targetId = req.params.id || leaveId;
  const targetStatus = status || (action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action);
  const leave = await LeaveService.reviewLeave(req.organizationId, targetId, targetStatus, req.user);
  return sendSuccess(res, leave, 'Leave status updated');
};

module.exports = {
  listLeaves,
  submitLeave,
  getLeaveById,
  updateStatus,
};
