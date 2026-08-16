const LookupService = require('../services/lookupService');
const { sendSuccess } = require('../utils/responseHelper');

const getLookups = async (req, res) => {
  const metadata = await LookupService.getAggregatedLookups(req.organizationId);
  return sendSuccess(res, metadata, 'Metadata lookups retrieved');
};

const listDepartments = async (req, res) => {
  const { departments } = await LookupService.getAggregatedLookups(req.organizationId);
  return sendSuccess(res, departments, 'Departments retrieved');
};

const createDepartment = async (req, res) => {
  const dept = await LookupService.createDepartment(req.organizationId, req.body);
  return sendSuccess(res, dept, 'Department created successfully', 201);
};

const updateDepartment = async (req, res) => {
  const dept = await LookupService.updateDepartment(req.organizationId, req.params.id, req.body);
  return sendSuccess(res, dept, 'Department updated successfully');
};

const deleteDepartment = async (req, res) => {
  const result = await LookupService.deleteDepartment(req.organizationId, req.params.id);
  return sendSuccess(res, result, result.message);
};

const listAcademicYears = async (req, res) => {
  const { academicYears } = await LookupService.getAggregatedLookups(req.organizationId);
  return sendSuccess(res, academicYears, 'Academic years retrieved');
};

const createAcademicYear = async (req, res) => {
  const year = await LookupService.createAcademicYear(req.organizationId, req.body);
  return sendSuccess(res, year, 'Academic year created successfully', 201);
};

const updateAcademicYear = async (req, res) => {
  const year = await LookupService.updateAcademicYear(req.organizationId, req.params.id, req.body);
  return sendSuccess(res, year, 'Academic year updated successfully');
};

const deleteAcademicYear = async (req, res) => {
  const result = await LookupService.deleteAcademicYear(req.organizationId, req.params.id);
  return sendSuccess(res, result, result.message);
};

module.exports = {
  getLookups,
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  listAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
};
