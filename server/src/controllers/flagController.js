const DisciplineService = require('../services/disciplineService');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');

const listFlags = async (req, res) => {
  const { flags, pagination } = await DisciplineService.listFlags(req.organizationId, req.query);
  return sendPaginated(res, flags, pagination, 'Flags retrieved');
};

const createFlag = async (req, res) => {
  const { studentId } = req.body;
  const flag = await DisciplineService.createFlag(req.organizationId, studentId, req.body, req.user._id);
  return sendSuccess(res, flag, 'Disciplinary incident recorded', 201);
};

const updateStatus = async (req, res) => {
  const { status } = req.body;
  const flag = await DisciplineService.updateFlagStatus(req.organizationId, req.params.id, status || 'resolved', req.user._id);
  return sendSuccess(res, flag, 'Flag status updated');
};

module.exports = {
  listFlags,
  createFlag,
  updateStatus,
};
