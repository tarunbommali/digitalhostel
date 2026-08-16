const OutingService = require('../services/outingService');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');

const getActiveOutings = async (req, res) => {
  const outings = await OutingService.getActiveOutings(req.organizationId);
  return sendSuccess(res, outings, 'Active outings retrieved');
};

const getOutingStats = async (req, res) => {
  const stats = await OutingService.getOutingStats(req.organizationId);
  return sendSuccess(res, stats, 'Outing statistics retrieved');
};

const scanPass = async (req, res) => {
  const result = await OutingService.scanPass(req.organizationId, req.body, req.user);
  return sendSuccess(res, result, 'Gate pass scanned successfully');
};

const listOutings = async (req, res) => {
  const { outings, pagination } = await OutingService.listOutings(req.organizationId, req.query, req.user);
  return sendPaginated(res, outings, pagination, 'Outing logs retrieved');
};

const createOuting = async (req, res) => {
  const outing = await OutingService.createOuting(req.organizationId, req.body, req.user);
  return sendSuccess(res, outing, 'Outing pass requested successfully', 201);
};

module.exports = {
  getActiveOutings,
  getOutingStats,
  scanPass,
  listOutings,
  createOuting,
};
