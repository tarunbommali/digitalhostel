const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./db');

dotenv.config();

const { validateProductionConfig, verifyProductionDatabaseTopology } = require('./utils/configValidator');
// Validate production runtime environment before starting
validateProductionConfig();

const { sanitizeInput } = require('./middleware/sanitizer');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/responseHelper');

// Import Routes
const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organizationRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const moderatorRoutes = require('./routes/moderators');
const studentRoutes = require('./routes/students');
const roomRoutes = require('./routes/rooms');
const outingRoutes = require('./routes/outings');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leaves');
const billRoutes = require('./routes/bills');
const paymentRoutes = require('./routes/payments');
const flagRoutes = require('./routes/flags');
const lookupRoutes = require('./routes/lookups');
const statsRoutes = require('./routes/stats');
const logRoutes = require('./routes/logs');

const app = express();

// 1. HTTP Security Headers with Helmet
app.use(helmet());

// 2. CORS Configuration with strict Origin validation
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) in non-production
      if (!origin && process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS Error: Origin ${origin} is not allowed by Access-Control policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'X-Organization-Id'],
  })
);

// 3. Request Parsing & Payload Sizing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Request Sanitization (NoSQL injection & prototype pollution protection)
app.use(sanitizeInput);

// 5. Rate Limiting
app.use('/api', apiLimiter);

// 6. Health Probes (Liveness & Readiness Separation)
app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/health/ready', async (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  if (dbState !== 1) {
    return res.status(503).json({
      status: 'unready',
      message: 'Database connection is not ready',
      dbState,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Quick ping to check database responsiveness
    await mongoose.connection.db.admin().ping();
    return res.status(200).json({
      status: 'ready',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({
      status: 'unready',
      message: 'Database ping failed',
      error: err.message,
    });
  }
});

// Backward-compatible /health alias
app.get('/health', (req, res) => {
  res.redirect(301, '/health/ready');
});

// 7. REST API Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/moderators', moderatorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/outings', outingRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/lookups', lookupRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/logs', logRoutes);

// 8. Catch-All 404 Route Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl} - Route not found on this server`));
});

// 9. Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    await verifyProductionDatabaseTopology();
    server = app.listen(PORT, () => {
      console.log(`[SERVER_RUNNING] Digital Hostel Express API running on port ${PORT}`);
    });
  });
}

// 10. Graceful Process Termination Handlers
const gracefulShutdown = (signal) => {
  console.log(`\n[SHUTDOWN] Received ${signal}. Closing HTTP server and database connections gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[SHUTDOWN] HTTP server closed.');
      mongoose.connection.close(false).then(() => {
        console.log('[SHUTDOWN] MongoDB connection closed cleanly. Process exiting.');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;