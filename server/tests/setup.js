const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

const getAuthToken = (user) => {
  const tokenPayload = {
    userId: user._id.toString(),
    role: user.role,
    moderatorType: user.role === 'moderator' ? user.moderatorType : undefined,
    organizationId: user.organizationId ? user.organizationId.toString() : undefined,
    tokenVersion: user.tokenVersion || 0,
  };
  return jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_jwt_secret_dev_key', { expiresIn: '1d' });
};

module.exports = {
  getAuthToken,
};
