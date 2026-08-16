const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole, requireModeratorCapability } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { validateObjectId } = require('../middleware/sanitizer');
const { asyncHandler } = require('../utils/responseHelper');

router.use(authMiddleware, tenantGuard);

// 1. Static Routes
router.get('/blocks', asyncHandler(roomController.listBlocks));
router.post(
  '/blocks',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(roomController.createBlock)
);

router.post(
  '/allocate',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(roomController.allocateBed)
);

router.post(
  '/deallocate',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(roomController.deallocateBed)
);

router.post(
  '/transfer',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(roomController.transferBed)
);

// 2. Room Listing & Creation
router.get(
  '/',
  requireRole(['admin', 'moderator']),
  asyncHandler(roomController.listRooms)
);

router.post(
  '/',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  asyncHandler(roomController.createRoom)
);

// 3. Parameterized Routes (/:id)
router.get('/:id', validateObjectId('id'), asyncHandler(roomController.getRoomById));

// Backward-compatible allocation route: /rooms/:id/allocate
router.post(
  '/:id/allocate',
  requireRole(['admin', 'moderator']),
  requireModeratorCapability(['administration', 'full']),
  validateObjectId('id'),
  asyncHandler(roomController.allocateBed)
);

module.exports = router;
