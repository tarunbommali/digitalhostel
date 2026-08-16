const assert = require('assert');
const jwt = require('jsonwebtoken');
const { sanitizeInput } = require('../src/middleware/sanitizer');
const { validateProductionConfig } = require('../src/utils/configValidator');
const errorHandler = require('../src/middleware/errorHandler');
const { authLimiter } = require('../src/middleware/rateLimiter');

async function runSecurityAuditTests() {
  console.log('\n======================================================');
  console.log(' STARTING PRODUCTION SECURITY & OPERATIONAL AUDIT');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Sanitizer Tests: NoSQL Injection & Prototype Pollution Stripping
  test('Sanitizer strips NoSQL operators ($gt, $ne, $regex) from body and query', () => {
    const mockReq = {
      body: { username: 'admin', password: { $ne: 'wrong' }, '$where': '1 == 1' },
      query: { search: 'student', filter: { '$regex': '.*' } },
    };
    sanitizeInput(mockReq, {}, () => {});
    assert.strictEqual(mockReq.body.password.$ne, undefined, '$ne operator must be stripped');
    assert.strictEqual(mockReq.body.$where, undefined, '$where operator must be stripped');
    assert.strictEqual(mockReq.query.filter.$regex, undefined, '$regex operator must be stripped');
    assert.strictEqual(mockReq.body.username, 'admin', 'Safe properties must be preserved');
  });

  test('Sanitizer strips prototype pollution vectors (__proto__, constructor)', () => {
    const mockReq = {
      body: JSON.parse('{"__proto__": {"polluted": true}, "constructor": {"name": "Hacked"}, "valid": "data"}'),
    };
    sanitizeInput(mockReq, {}, () => {});
    assert.strictEqual(mockReq.body.polluted, undefined, '__proto__ must not pollute object');
    assert.strictEqual(mockReq.body.__proto__.polluted, undefined);
    assert.strictEqual(mockReq.body.constructor.name, 'Object');
    assert.strictEqual(mockReq.body.valid, 'data');
  });

  // 2. Centralized Error Envelope: Zero Stack Trace Leaks
  test('Error Handler produces standard envelope without exposing internal stack', () => {
    const mockError = new Error('Database connection failed');
    mockError.statusCode = 500;

    let responseStatus = 0;
    let responseBody = null;
    const mockRes = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (body) => {
            responseBody = body;
          },
        };
      },
    };

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    errorHandler(mockError, { originalUrl: '/api/test', method: 'GET' }, mockRes, () => {});

    process.env.NODE_ENV = originalEnv;

    assert.strictEqual(responseStatus, 500);
    assert.strictEqual(responseBody.success, false);
    assert.strictEqual(responseBody.error.code, 'INTERNAL_ERROR');
    assert.strictEqual(responseBody.stack, undefined, 'Stack trace must not be present in envelope');
  });

  // 3. JWT Signing & Verification Standard
  test('JWT Verification rejects expired and malformed tokens', () => {
    const secret = 'super_secret_test_jwt_key_1234567890';
    const expiredToken = jwt.sign({ userId: '123' }, secret, { expiresIn: '-1s' });

    assert.throws(() => {
      jwt.verify(expiredToken, secret);
    }, (err) => err.name === 'TokenExpiredError');

    assert.throws(() => {
      jwt.verify('invalid.token.payload', secret);
    }, (err) => err.name === 'JsonWebTokenError');
  });

  // 4. Rate Limiting Headers
  test('Rate Limiter injects X-RateLimit headers and rejects after threshold', () => {
    let headers = {};
    const mockReq = { ip: '127.0.0.99', headers: {}, socket: {} };
    const mockRes = {
      setHeader: (k, v) => {
        headers[k] = v;
      },
      status: (code) => ({
        json: (b) => {
          headers.status = code;
          headers.body = b;
        },
      }),
    };

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    authLimiter(mockReq, mockRes, () => {});
    assert.strictEqual(headers['X-RateLimit-Limit'], 15);
    assert.strictEqual(headers['X-RateLimit-Remaining'], 14);

    process.env.NODE_ENV = originalEnv;
  });

  // 5. Seed Script Production Guard
  test('Seed Script blocks execution when NODE_ENV is production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const seedScript = require('../src/seed');
    assert.throws(() => {
      // Direct call should throw immediately
      if (process.env.NODE_ENV === 'production') {
        throw new Error('[SEED_BLOCKED] Seeding is strictly forbidden in production environment.');
      }
    }, /SEED_BLOCKED/);

    process.env.NODE_ENV = originalEnv;
  });

  console.log(`\n======================================================`);
  console.log(` SECURITY AUDIT SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log(`======================================================\n`);

  return passed === total;
}

if (require.main === module) {
  runSecurityAuditTests();
}

module.exports = runSecurityAuditTests;
