const Organization = require("../models/Organization");

/**
 * Resolves organizationId for a request:
 * 1. From authenticated non-super_admin user (`req.user.organizationId` or `req.organizationId`).
 * 2. From `X-Organization-Id` HTTP request header.
 * 3. From query param `organizationId` or route param `slug`.
 */
async function getOrganizationId(req) {
  if (req.organizationId) {
    return req.organizationId;
  }
  if (req.user && req.user.role !== "super_admin" && req.user.organizationId) {
    return req.user.organizationId;
  }

  const headerOrgId = req.headers["x-organization-id"];
  if (headerOrgId) {
    return headerOrgId;
  }

  if (req.query.organizationId) {
    return req.query.organizationId;
  }

  if (req.params.slug) {
    const org = await Organization.findOne({
      slug: req.params.slug.toLowerCase(),
    });
    if (org) return org._id;
  }

  return req.user ? req.user.organizationId : null;
}

module.exports = {
  getOrganizationId,
};
