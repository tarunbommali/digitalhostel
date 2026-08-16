const BillingService = require('../services/billingService');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');

const listBills = async (req, res) => {
  const { bills, pagination } = await BillingService.listBills(req.organizationId, req.query, req.user);
  return sendPaginated(res, bills, pagination, 'Bills retrieved');
};

const getBillById = async (req, res) => {
  const bill = await BillingService.getBillById(req.organizationId, req.params.id, req.user);
  return sendSuccess(res, bill, 'Bill details retrieved');
};

const getStudentSummary = async (req, res) => {
  const summary = await BillingService.getStudentBillSummary(req.organizationId, req.params.studentId, req.user);
  return sendSuccess(res, summary, 'Student ledger summary retrieved');
};

const generateBills = async (req, res) => {
  const result = await BillingService.generateMonthlyBills(req.organizationId, req.body, req.user._id);
  return sendSuccess(res, result, 'Monthly bills generated successfully', 201);
};

const verifyPeriod = async (req, res) => {
  const result = await BillingService.verifyPeriod(req.organizationId, req.body, req.user._id);
  return sendSuccess(res, result, result.message);
};

const updateBatch = async (req, res) => {
  const result = await BillingService.updateBatch(req.organizationId, req.body, req.user._id);
  return sendSuccess(res, result, result.message);
};

module.exports = {
  listBills,
  getBillById,
  getStudentSummary,
  generateBills,
  verifyPeriod,
  updateBatch,
};
