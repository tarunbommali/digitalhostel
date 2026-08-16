const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { passwordResetLimiter, authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../utils/responseHelper');

router.post('/login', authLimiter, asyncHandler(authController.login));
router.post('/forgot-password', passwordResetLimiter, asyncHandler(authController.forgotPassword));
router.post('/reset-password', passwordResetLimiter, asyncHandler(authController.resetPassword));
router.get('/me', authMiddleware, asyncHandler(authController.getMe));
router.post('/change-password', authMiddleware, asyncHandler(authController.changePassword));

module.exports = router;
