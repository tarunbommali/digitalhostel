const Organization = require('../models/Organization');
const User = require('../models/User');
const Student = require('../models/Student');
const OrganizationService = require('../services/organizationService');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');

const getSystemStats = async (req, res) => {
  const [totalOrgs, totalUsers, totalStudents] = await Promise.all([
    Organization.countDocuments(),
    User.countDocuments(),
    Student.countDocuments(),
  ]);

  return sendSuccess(res, {
    totalOrganizations: totalOrgs,
    totalUsers,
    totalStudents,
    platformStatus: 'healthy',
  });
};

const listOrganizations = async (req, res) => {
  const { organizations, pagination } = await OrganizationService.listOrganizations(req.query);
  return sendPaginated(res, organizations, pagination, 'Organizations list retrieved');
};

const createOrganization = async (req, res) => {
  const result = await OrganizationService.provisionOrganization(req.body, req.user._id);
  return sendSuccess(res, result, 'Tenant organization created successfully', 201);
};

module.exports = {
  getSystemStats,
  listOrganizations,
  createOrganization,
};
