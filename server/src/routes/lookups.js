const express = require('express');
const router = express.Router();
const lookupController = require('../controllers/lookupController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { validateObjectId } = require('../middleware/sanitizer');
const { asyncHandler } = require('../utils/responseHelper');

router.use(authMiddleware, tenantGuard);

// 1. Aggregated Metadata Lookups
router.get('/', asyncHandler(lookupController.getLookups));

// 2. Departments
router.get('/departments', asyncHandler(lookupController.listDepartments));

router.post(
  '/departments',
  requireRole(['admin']),
  asyncHandler(lookupController.createDepartment)
);

router.put(
  '/departments/:id',
  requireRole(['admin']),
  validateObjectId('id'),
  asyncHandler(lookupController.updateDepartment)
);

router.delete(
  '/departments/:id',
  requireRole(['admin']),
  validateObjectId('id'),
  asyncHandler(lookupController.deleteDepartment)
);

// 3. Academic Years
router.get('/academic-years', asyncHandler(lookupController.listAcademicYears));

router.post(
  '/academic-years',
  requireRole(['admin']),
  asyncHandler(lookupController.createAcademicYear)
);

router.put(
  '/academic-years/:id',
  requireRole(['admin']),
  validateObjectId('id'),
  asyncHandler(lookupController.updateAcademicYear)
);

router.patch(
  '/academic-years/:id',
  requireRole(['admin']),
  validateObjectId('id'),
  asyncHandler(lookupController.updateAcademicYear)
);

router.delete(
  '/academic-years/:id',
  requireRole(['admin']),
  validateObjectId('id'),
  asyncHandler(lookupController.deleteAcademicYear)
);

// 4. Hostel Blocks
router.get('/blocks', asyncHandler(lookupController.listBlocks));

router.post(
  '/blocks',
  requireRole(['admin']),
  asyncHandler(lookupController.createBlock)
);

router.put(
  '/blocks/:id',
  requireRole(['admin']),
  validateObjectId('id'),
  asyncHandler(lookupController.updateBlock)
);

router.patch(
  '/blocks/:id',
  requireRole(['admin']),
  validateObjectId('id'),
  asyncHandler(lookupController.updateBlock)
);

router.delete(
  '/blocks/:id',
  requireRole(['admin']),
  validateObjectId('id'),
  asyncHandler(lookupController.deleteBlock)
);

module.exports = router;
