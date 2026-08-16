const DashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/responseHelper');

const getDashboardStats = async (req, res) => {
  const stats = await DashboardService.getAggregatedMetrics(req.organizationId);
  return sendSuccess(res, stats, 'Dashboard metrics retrieved');
};

module.exports = {
  getDashboardStats,
};
