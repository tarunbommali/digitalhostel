const AuthService = require('../services/authService');
const { sendSuccess } = require('../utils/responseHelper');

const login = async (req, res) => {
  const { email, password, tenantSlug } = req.body;
  const result = await AuthService.login(email, password, tenantSlug);
  return sendSuccess(res, result, 'Login successful');
};

const getMe = async (req, res) => {
  const profile = await AuthService.getProfile(req.user._id);
  return sendSuccess(res, profile, 'Profile retrieved successfully');
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(req.user._id, currentPassword, newPassword);
  return sendSuccess(res, result, 'Password changed successfully');
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  return sendSuccess(res, result, result.message);
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const result = await AuthService.resetPassword(token, password);
  return sendSuccess(res, result, result.message);
};

module.exports = {
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
