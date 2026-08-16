const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const app = require('../../src/index');
const Organization = require('../../src/models/Organization');
const User = require('../../src/models/User');
const { getAuthToken } = require('../setup');

describe('Integration: Secure Password Reset & Token Lifecycle (SEC-RESET-01)', () => {
  let org, victimUser;

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
      location: 'Bangalore',
      adminEmail: 'admin.skyline@hostel.edu',
    });

    victimUser = await User.create({
      email: 'victim.student@hostel.edu',
      password: 'OriginalPassword123!',
      role: 'student',
      fullName: 'Victim Student',
      organizationId: org._id,
      isActive: true,
      tokenVersion: 0,
    });
  });

  test('1. forgot-password with existing user returns generic success message', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'victim.student@hostel.edu' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/password reset link/i);

    // Verify SHA-256 hash was stored in DB (not plaintext)
    const userInDb = await User.findById(victimUser._id);
    expect(userInDb.resetPasswordToken).toBeDefined();
    expect(userInDb.resetPasswordToken).toHaveLength(64); // SHA-256 hex length
    expect(userInDb.resetPasswordExpires).toBeDefined();
  });

  test('2. forgot-password with unknown email returns identical generic response (Anti-Enumeration)', async () => {
    const res1 = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'victim.student@hostel.edu' });

    const res2 = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent.ghost@hostel.edu' });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body.message).toBe(res2.body.message);
  });

  test('3. reset-password with valid token successfully updates password and clears token', async () => {
    // Generate valid raw token and hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    await User.findByIdAndUpdate(victimUser._id, {
      resetPasswordToken: hashed,
      resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'BrandNewSecurePassword123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify DB state: token fields cleared
    const updatedUser = await User.findById(victimUser._id);
    expect(updatedUser.resetPasswordToken).toBeUndefined();
    expect(updatedUser.resetPasswordExpires).toBeUndefined();
    expect(updatedUser.passwordChangedAt).toBeDefined();
    expect(updatedUser.tokenVersion).toBe(1);

    // Verify login with new password succeeds
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'victim.student@hostel.edu', password: 'BrandNewSecurePassword123!' });
    expect(loginRes.status).toBe(200);

    // Verify login with old password fails
    const oldLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'victim.student@hostel.edu', password: 'OriginalPassword123!' });
    expect(oldLoginRes.status).toBe(401);
  });

  test('4. reset-password with invalid token is rejected with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'completely_fake_invalid_token_12345', password: 'NewPassword123!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('5. reset-password with expired token (>15 min) is rejected', async () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Set expiration in the past (1 minute ago)
    await User.findByIdAndUpdate(victimUser._id, {
      resetPasswordToken: hashed,
      resetPasswordExpires: new Date(Date.now() - 60 * 1000),
    });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'NewPassword123!' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid or expired/i);
  });

  test('6. reset-password token cannot be reused (Single-Use Enforcement)', async () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    await User.findByIdAndUpdate(victimUser._id, {
      resetPasswordToken: hashed,
      resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    // First reset succeeds
    const res1 = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'FirstNewPassword123!' });
    expect(res1.status).toBe(200);

    // Second reset attempt with same token fails
    const res2 = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'SecondNewPassword123!' });
    expect(res2.status).toBe(400);
  });

  test('7. reset-password rejects weak password (<8 characters)', async () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    await User.findByIdAndUpdate(victimUser._id, {
      resetPasswordToken: hashed,
      resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 8 characters/i);
  });

  test('8. REGRESSION ATTACK TEST: Unauthenticated email+password-only payload without token is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'victim.student@hostel.edu',
        password: 'AttackerPassword123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/reset token is required/i);

    // Verify victim password remains unchanged
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'victim.student@hostel.edu', password: 'OriginalPassword123!' });
    expect(loginRes.status).toBe(200);
  });

  test('9. Prior active JWT session is invalidated immediately after password reset', async () => {
    // Generate valid session token before reset (tokenVersion: 0)
    const oldSessionToken = getAuthToken(victimUser);

    // Verify old token works initially
    const preCheck = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${oldSessionToken}`);
    expect(preCheck.status).toBe(200);

    // Execute password reset (which increments tokenVersion to 1)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    await User.findByIdAndUpdate(victimUser._id, {
      resetPasswordToken: hashed,
      resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'NewSecurePassword123!' });

    // Request with old token (tokenVersion 0) must now be rejected with 401 Unauthorized
    const postCheck = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${oldSessionToken}`);

    expect(postCheck.status).toBe(401);
    expect(postCheck.body.message).toMatch(/password was recently changed/i);
  });
});
