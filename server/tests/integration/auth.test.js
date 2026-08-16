const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/index');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const { getAuthToken } = require('../setup');

describe('Integration: Authentication & Password Lifecycle (FR-AUTH-01 to FR-AUTH-04)', () => {
  let org, adminUser, disabledUser;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_test');
    }
  });

  beforeEach(async () => {
    await Organization.deleteMany({});
    await User.deleteMany({});

    org = await Organization.create({
      name: 'Skyline Luxury Hostel',
      slug: 'skyline-luxury',
      location: 'Bangalore Campus',
      adminEmail: 'admin.skyline@hostel.edu',
    });

    adminUser = await User.create({
      email: 'admin.skyline@hostel.edu',
      password: 'AdminPassword123!',
      role: 'admin',
      fullName: 'Skyline Admin',
      organizationId: org._id,
      isActive: true,
    });

    disabledUser = await User.create({
      email: 'disabled.user@hostel.edu',
      password: 'DisabledPassword123!',
      role: 'student',
      fullName: 'Disabled Student',
      organizationId: org._id,
      isActive: false,
    });
  });

  test('POST /api/auth/login with valid credentials returns token and standardized envelope', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.skyline@hostel.edu', password: 'AdminPassword123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('admin.skyline@hostel.edu');
    expect(res.body.data.user.role).toBe('admin');
  });

  test('POST /api/auth/login with invalid password returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.skyline@hostel.edu', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('Disabled user login returns 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'disabled.user@hostel.edu', password: 'DisabledPassword123!' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Authenticated request with disabled account returns 403 Forbidden', async () => {
    const token = getAuthToken(disabledUser);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test('POST /api/auth/forgot-password dispatches message without leaking user existence', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@hostel.edu' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/password reset link/i);
  });

  test('HTTP response includes Helmet security headers', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });
});
