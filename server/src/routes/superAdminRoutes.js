const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { asyncHandler } = require('../utils/responseHelper');

router.use(authMiddleware, requireRole(['super_admin']));

router.get('/stats', asyncHandler(superAdminController.getSystemStats));
router.get('/organizations', asyncHandler(superAdminController.listOrganizations));
router.post('/organizations', asyncHandler(superAdminController.createOrganization));

module.exports = router;
