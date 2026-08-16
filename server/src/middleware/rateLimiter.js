/**
 * Production Rate Limiting Middleware
 * In-memory sliding-window token bucket implementation.
 */

class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 100, message = 'Too many requests. Please try again later.') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    this.clients = new Map();

    // Periodic sweep to prevent memory leaks
    setInterval(() => {
      const now = Date.now();
      for (const [ip, data] of this.clients.entries()) {
        if (now - data.resetTime > this.windowMs) {
          this.clients.delete(ip);
        }
      }
    }, this.windowMs).unref();
  }

  middleware() {
    return (req, res, next) => {
      // In test mode, skip rate limiting unless specifically testing rate limiter
      if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
        return next();
      }

      const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-client';
      const now = Date.now();

      let clientData = this.clients.get(clientIp);
      if (!clientData || now > clientData.resetTime) {
        clientData = {
          count: 0,
          resetTime: now + this.windowMs,
        };
        this.clients.set(clientIp, clientData);
      }

      clientData.count++;
      const remaining = Math.max(0, this.maxRequests - clientData.count);
      const resetSeconds = Math.ceil((clientData.resetTime - now) / 1000);

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetSeconds);

      if (clientData.count > this.maxRequests) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: this.message,
            retryAfterSeconds: resetSeconds,
          },
        });
      }

      next();
    };
  }
}

// 1. Strict Limiter for Authentication & Login (15 attempts per 15 minutes)
const authLimiter = new RateLimiter(15 * 60 * 1000, 15, 'Too many login attempts. Please try again after 15 minutes.').middleware();

// 2. Strict Limiter for Password Reset Endpoints (5 requests per 15 minutes)
const passwordResetLimiter = new RateLimiter(15 * 60 * 1000, 5, 'Too many password reset requests. Please try again after 15 minutes.').middleware();

// 3. General API Limiter (300 requests per minute)
const apiLimiter = new RateLimiter(60 * 1000, 300, 'Too many API requests. Please slow down.').middleware();

module.exports = {
  RateLimiter,
  authLimiter,
  passwordResetLimiter,
  apiLimiter,
};
