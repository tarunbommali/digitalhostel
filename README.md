<<<<<<< HEAD
# 🏢 Digital Hostel — Multi-Tenant SaaS Platform
=======
# Inside Home
>>>>>>> d99bafbe5013d606aa466545d484528fba29246f

Digital Hostel is an enterprise multi-tenant hostel management system featuring location-based discovery, tenant branding, role-based access control, digital ID QR scanner workflows, bed allocation concurrency, billing reconciliation, and disaster recovery.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Redux Toolkit**, **Express.js**, and **MongoDB / Mongoose**.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment
Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hostel_db
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### 3. Seed Database
```bash
cd server
npm run seed:admin
cd ..
```

### 4. Run Development Server (Frontend + Backend)
```bash
npm run dev
```
- **Web App**: `http://localhost:5173/`
- **Super Admin Portal**: `http://localhost:5173/super-admin`
- **API Health Check**: `http://localhost:5000/health/live`

---

## 🔑 Default Credentials

| Portal / Tenant | Route | Email | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `/super-admin` | `superadmin@insidehome.com` | `SuperAdmin@123` | Platform Super Admin |
| **Skyline Luxury Hostel** | `organization/skyline-luxury/login` | `admin@skylinehostel.com` | `Bommali@2001` | Tenant Admin |
| **Metro Stays** | `organization/metro-stays/login` | `tarunbommali2810@gmail.com` | `Bommali@2001` | Tenant Admin |

---

## 🧪 Automated Testing & Verification

Run tests from `server/`:
```bash
cd server
npm test                     # Run all 9 Jest integration test suites (30 tests)
node tests/securityVerification.js # Run security sanitizer & rate limit checks
node tests/drRestoreDrill.js       # Run disaster recovery restore simulation
npm audit                    # Run vulnerability scan
```

---

## 📁 Repository Structure

```text
DigitalHostel/
├── package.json                 # Root script runner (concurrent dev runner)
├── client/                      # Frontend Application (React + Vite + TS + Tailwind v4)
│   ├── src/
│   │   ├── components/          # Reusable UI & Layout Components
│   │   ├── core/                # Auth & Tenant Contexts, API Client
│   │   ├── hooks/               # Custom Hooks (useOnline, useDebounce, useAuthUser)
│   │   ├── modules/             # Feature Modules (students, rooms, bills, guard, etc.)
│   │   └── App.tsx              # Application Routing
│   └── package.json
│
└── server/                      # Backend REST API (Node.js + Express + Mongoose)
    ├── src/
    │   ├── controllers/         # REST API Controllers
    │   ├── middleware/          # Auth, RBAC, tenantGuard, rateLimiter, sanitizer, errorHandler
    │   ├── models/              # 17 Mongoose Schemas with compound indexes
    │   ├── routes/              # Express API Routes
    │   ├── services/            # Domain Services & Transaction Logic
    │   ├── utils/               # configValidator, transactionHelper, responseHelper
    │   ├── db.js                # Database connection
    │   ├── index.js             # Express app entrypoint
    │   └── seed.js              # Multi-tenant deterministic seeder
    ├── tests/
    │   ├── integration/         # 9 Jest integration test suites
    │   ├── setup.js             # Test database setup & auth token helper
    │   ├── securityVerification.js # Security verification script
    │   └── drRestoreDrill.js    # Cold-restore simulation runner
    └── package.json
```

---

## 🛡️ Security & Architecture Standards

1. **Multi-Tenancy**: Strict `organizationId` scoping enforced on all 17 models with compound unique indexes.
2. **ACID Transactions**: Multi-document writes (`roomService.allocateBed`, `paymentService.verifyAndSettlePayment`) use Mongoose transaction sessions.
3. **Password Security**: Single-use 15-minute SHA-256 tokens with automatic JWT session invalidation (`tokenVersion` / `passwordChangedAt`).
4. **Defensive Headers**: `helmet` enabled on all endpoints with strict CORS origin validation.
5. **Rate Limiting**: In-memory token bucket rate limiters for auth and API routes.
6. **Centralized Envelope**: Standardized `{ success, message, data, pagination, error }` JSON responses.
