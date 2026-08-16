const PaymentService = require('../services/paymentService');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');

const listPayments = async (req, res) => {
  const { payments, pagination } = await PaymentService.listPayments(req.organizationId, req.query, req.user);
  return sendPaginated(res, payments, pagination, 'Payments retrieved');
};

const getPaymentById = async (req, res) => {
  const payment = await PaymentService.getPaymentById(req.organizationId, req.params.id, req.user);
  return sendSuccess(res, payment, 'Payment details retrieved');
};

const recordPayment = async (req, res) => {
  const result = await PaymentService.recordPayment(req.organizationId, req.body, req.user._id);
  return sendSuccess(res, result, 'Payment recorded and settled successfully', 201);
};

const verifyPayment = async (req, res) => {
  const { paymentId } = req.body;
  const targetId = req.params.id || paymentId;
  const result = await PaymentService.verifyAndSettlePayment(req.organizationId, targetId, req.user._id);
  return sendSuccess(res, result, 'Payment verified and settled');
};

const getSummary = async (req, res) => {
  const summary = await PaymentService.getSummary(req.organizationId);
  return sendSuccess(res, summary, 'Payment collection summary retrieved');
};

module.exports = {
  listPayments,
  getPaymentById,
  recordPayment,
  verifyPayment,
  getSummary,
};
