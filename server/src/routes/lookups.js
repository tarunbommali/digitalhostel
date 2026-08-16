const express = require('express');
const router = express.Router();
const lookupController = require('../controllers/lookupController');
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { tenantGuard } = require('../middleware/tenantGuard');
const { validateObjectId } = require('../middleware/sanitizer');
const { asyncHandler } = require('../utils/responseHelper');

router.use(authMiddleware, tenantGuard);

router.get('/', asyncHandler(lookupController.getLookups));
router.get('/departments', asyncHandler(lookupController.listDepartments));
router.get('/academic-years', asyncHandler(lookupController.listAcademicYears));

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

module.exports = router;
