const Organization = require('../models/Organization');
const User = require('../models/User');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require('../utils/responseHelper');
const AuditService = require('./auditService');

class OrganizationService {
  static async getBySlug(slug) {
    if (!slug) {
      throw new BadRequestError('Organization slug is required');
    }

    const org = await Organization.findOne({ slug: slug.toLowerCase().trim(), isActive: true })
      .select('name slug location branding settings isActive')
      .lean();

    if (!org) {
      throw new NotFoundError(`Hostel organization '${slug}' not found or inactive`);
    }

    // Return safe public organization DTO
    return {
      id: org._id,
      name: org.name,
      slug: org.slug,
      location: org.location,
      branding: org.branding || {
        primaryColor: '#6366f1',
        secondaryColor: '#4f46e5',
        tagline: 'Smart Multi-Tenant Hostel Living',
      },
      isActive: org.isActive,
    };
  }

  static async listOrganizations(query = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.search) {
      filter.name = { $regex: query.search.trim(), $options: 'i' };
    }

    const [organizations, total] = await Promise.all([
      Organization.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Organization.countDocuments(filter),
    ]);

    return { organizations, pagination: { total, page, limit } };
  }

  static async provisionOrganization(payload, actorId) {
    const { name, slug, location, adminEmail, adminPassword, branding, settings } = payload;
    if (!name || !slug || !location || !adminEmail || !adminPassword) {
      throw new BadRequestError('Name, slug, location, adminEmail, and adminPassword are required');
    }

    const cleanSlug = slug.toLowerCase().trim();
    const existingOrg = await Organization.findOne({ slug: cleanSlug });
    if (existingOrg) {
      throw new ConflictError(`Organization with slug '${cleanSlug}' already exists`);
    }

    const org = await Organization.create({
      name: name.trim(),
      slug: cleanSlug,
      location: location.trim(),
      adminEmail: adminEmail.toLowerCase().trim(),
      branding: branding || {},
      settings: settings || {},
    });

    const adminUser = await User.create({
      email: adminEmail.toLowerCase().trim(),
      password: adminPassword,
      role: 'admin',
      fullName: `${name.trim()} Administrator`,
      organizationId: org._id,
      isActive: true,
    });

    AuditService.recordAuditSafe(
      org._id,
      actorId,
      'ORG_PROVISIONED',
      'Organization',
      org._id,
      { name: org.name, slug: org.slug, admin: adminUser.email }
    );

    return { organization: org, adminUser };
  }

  static async updateOrganization(targetOrgId, payload, actorUser) {
    if (actorUser.role !== 'super_admin' && actorUser.organizationId.toString() !== targetOrgId.toString()) {
      throw new ForbiddenError('Access denied: You can only modify your own organization');
    }

    const org = await Organization.findById(targetOrgId);
    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    if (payload.name) org.name = payload.name.trim();
    if (payload.location) org.location = payload.location.trim();
    if (payload.contactPhone) org.contactPhone = payload.contactPhone.trim();
    if (payload.supportEmail) org.supportEmail = payload.supportEmail.trim();

    if (payload.branding && typeof payload.branding === 'object') {
      org.branding = { ...org.branding.toObject(), ...payload.branding };
    }

    if (payload.settings && typeof payload.settings === 'object' && actorUser.role === 'super_admin') {
      org.settings = { ...org.settings.toObject(), ...payload.settings };
    }

    await org.save();

    AuditService.recordAuditSafe(
      org._id,
      actorUser._id,
      'ORG_UPDATED',
      'Organization',
      org._id,
      payload
    );

    return org;
  }
}

module.exports = OrganizationService;
