const OrganizationService = require('../services/organizationService');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');

const getBySlug = async (req, res) => {
  const publicOrg = await OrganizationService.getBySlug(req.params.slug);
  return sendSuccess(res, publicOrg, 'Organization profile retrieved');
};

const listOrganizations = async (req, res) => {
  const { organizations, pagination } = await OrganizationService.listOrganizations(req.query);
  return sendPaginated(res, organizations, pagination, 'Organizations retrieved');
};

const provisionOrganization = async (req, res) => {
  const result = await OrganizationService.provisionOrganization(req.body, req.user?._id);
  return sendSuccess(res, result, 'Organization provisioned successfully', 201);
};

const updateOrganization = async (req, res) => {
  const org = await OrganizationService.updateOrganization(req.params.id, req.body, req.user);
  return sendSuccess(res, org, 'Organization updated successfully');
};

module.exports = {
  getBySlug,
  listOrganizations,
  provisionOrganization,
  updateOrganization,
};
