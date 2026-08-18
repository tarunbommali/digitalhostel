const mongoose = require('mongoose');
const Organization = require('../models/Organization');
const User = require('../models/User');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require('../utils/responseHelper');
const AuditService = require('./auditService');
const { isFeatureEnabled } = require('../config/plans');

class OrganizationService {
  /**
   * Retrieves active organizations for public hostel directory listing
   */
  static async getPublicOrganizations(query = {}) {
    const filter = { isActive: true };

    if (query.location && query.location !== 'All') {
      filter.location = { $regex: new RegExp(`^${query.location.trim()}$`, 'i') };
    }

    if (query.search && query.search.trim()) {
      const searchRegex = { $regex: query.search.trim(), $options: 'i' };
      filter.$or = [{ name: searchRegex }, { location: searchRegex }, { slug: searchRegex }];
    }

    const organizations = await Organization.find(filter)
      .select('name slug location plan subscriptionStatus branding contactPhone supportEmail isActive createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return organizations.map((org) => ({
      _id: org._id,
      id: org._id,
      name: org.name,
      slug: org.slug,
      location: org.location,
      plan: org.plan || 'BASIC',
      subscriptionStatus: org.subscriptionStatus || 'active',
      branding: org.branding || {
        primaryColor: '#6366f1',
        secondaryColor: '#4f46e5',
        tagline: 'Smart Multi-Tenant Hostel Living',
      },
      contactPhone: org.contactPhone,
      supportEmail: org.supportEmail,
      isActive: org.isActive,
    }));
  }

  /**
   * Retrieves unique location list of all active organizations for filtering
   */
  static async getPublicLocations() {
    const locations = await Organization.find({ isActive: true }).distinct('location');
    const validLocations = locations
      .filter((loc) => loc && typeof loc === 'string' && loc.trim() !== '')
      .map((loc) => loc.trim());

    return Array.from(new Set(validLocations));
  }

  static async getBySlug(slug) {
    if (!slug) {
      throw new BadRequestError('Organization slug is required');
    }

    const cleanSlug = slug.toLowerCase().trim();
    const isObjectId = mongoose.isValidObjectId(cleanSlug) && /^[0-9a-fA-F]{24}$/.test(cleanSlug);

    let org = await Organization.findOne({ slug: cleanSlug, isActive: true })
      .select('name slug location plan subscriptionStatus branding settings features isActive')
      .lean();

    if (!org && isObjectId) {
      org = await Organization.findOne({ _id: cleanSlug, isActive: true })
        .select('name slug location plan subscriptionStatus branding settings features isActive')
        .lean();
    }

    if (!org) {
      throw new NotFoundError(`Hostel organization '${slug}' not found or inactive`);
    }

    // Return safe public organization DTO
    return {
      _id: org._id,
      id: org._id,
      name: org.name,
      slug: org.slug,
      location: org.location,
      plan: org.plan || 'BASIC',
      subscriptionStatus: org.subscriptionStatus || 'active',
      branding: org.branding || {
        primaryColor: '#6366f1',
        secondaryColor: '#4f46e5',
        tagline: 'Smart Multi-Tenant Hostel Living',
      },
      settings: org.settings,
      features: org.features || {},
      isActive: org.isActive,
    };
  }

  static async getById(id) {
    if (!id) {
      throw new BadRequestError('Organization ID is required');
    }

    const org = await Organization.findById(id).lean();
    if (!org) {
      throw new NotFoundError(`Organization with ID '${id}' not found`);
    }

    return org;
  }

  static async listOrganizations(query = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.search) {
      const searchRegex = { $regex: query.search.trim(), $options: 'i' };
      filter.$or = [{ name: searchRegex }, { location: searchRegex }, { slug: searchRegex }];
    }
    if (query.plan && query.plan !== 'ALL') {
      filter.plan = query.plan.toUpperCase();
    }
    if (query.subscriptionStatus && query.subscriptionStatus !== 'ALL') {
      filter.subscriptionStatus = query.subscriptionStatus.toLowerCase();
    }

    const [organizations, total] = await Promise.all([
      Organization.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Organization.countDocuments(filter),
    ]);

    return { organizations, pagination: { total, page, limit } };
  }

  static async provisionOrganization(payload, actorId) {
    const {
      name,
      slug,
      location,
      adminEmail,
      adminPassword,
      branding,
      settings,
      plan,
      subscriptionStatus,
    } = payload;

    if (!name || !slug || !location || !adminEmail || !adminPassword) {
      throw new BadRequestError('Name, slug, location, adminEmail, and adminPassword are required');
    }

    const cleanSlug = slug.toLowerCase().trim();
    const existingOrg = await Organization.findOne({ slug: cleanSlug });
    if (existingOrg) {
      throw new ConflictError(`Organization with slug '${cleanSlug}' already exists`);
    }

    // Default tier on registration is BASIC (Free subscription) unless specified
    const selectedPlan = (plan || 'BASIC').toUpperCase();
    const selectedStatus = (subscriptionStatus || 'active').toLowerCase();

    const org = await Organization.create({
      name: name.trim(),
      slug: cleanSlug,
      location: location.trim(),
      adminEmail: adminEmail.toLowerCase().trim(),
      plan: selectedPlan,
      subscriptionStatus: selectedStatus,
      branding: branding || {},
      settings: settings || {},
      isPublic: true,
      isActive: true,
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
      { name: org.name, slug: org.slug, plan: org.plan, admin: adminUser.email }
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

    if (actorUser.role === 'super_admin') {
      if (payload.plan) org.plan = payload.plan.toUpperCase();
      if (payload.subscriptionStatus) org.subscriptionStatus = payload.subscriptionStatus.toLowerCase();
      if (typeof payload.isActive === 'boolean') org.isActive = payload.isActive;
      if (typeof payload.isPublic === 'boolean') org.isPublic = payload.isPublic;
    }

    if (payload.branding && typeof payload.branding === 'object') {
      if (actorUser.role !== 'super_admin' && !isFeatureEnabled(org.plan, 'customBranding')) {
        throw new ForbiddenError(
          'Custom tenant branding (colors, logos) is not included in the Basic plan. Please upgrade to Pro or Enterprise.'
        );
      }
      org.branding = { ...org.branding.toObject(), ...payload.branding };
    }

    if (payload.settings && typeof payload.settings === 'object' && actorUser.role === 'super_admin') {
      org.settings = { ...org.settings.toObject(), ...payload.settings };
    }

    if (payload.features && typeof payload.features === 'object') {
      const currentFeatures = org.features ? (typeof org.features.toObject === 'function' ? org.features.toObject() : org.features) : {};
      org.features = { ...currentFeatures, ...payload.features };
      org.markModified('features');
    } else if (payload.featureId && payload.config) {
      const currentFeatures = org.features ? (typeof org.features.toObject === 'function' ? org.features.toObject() : org.features) : {};
      const existingFeatureConfig = currentFeatures[payload.featureId] || {};
      currentFeatures[payload.featureId] = { ...existingFeatureConfig, ...payload.config };
      org.features = currentFeatures;
      org.markModified('features');
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
