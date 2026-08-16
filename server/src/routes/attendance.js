const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole, requireModeratorCapability } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { asyncHandler } = require('../utils/responseHelper');

router.use(authMiddleware, tenantGuard);

router.get('/sessions', asyncHandler(attendanceController.listSessions));
router.get('/stats', asyncHandler(attendanceController.getStats));

router.post(
  '/sessions',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['attendance_only', 'full']),
  asyncHandler(attendanceController.createSession)
);

router.post(
  '/mark',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['attendance_only', 'full']),
  asyncHandler(attendanceController.markAttendance)
);

router.post(
  '/bulk-mark',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['attendance_only', 'full']),
  asyncHandler(attendanceController.bulkMark)
);

router.get(
  '/',
  requireRole(['admin', 'moderator']),
  asyncHandler(attendanceController.queryRecords)
);

module.exports = router;
