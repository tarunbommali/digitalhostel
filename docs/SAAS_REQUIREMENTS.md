# 🏢 SaaS Multi-Tenancy Product - Comprehensive Requirements List

Based on the **Campus Stay** enterprise multi-tenant hostel management architecture, this document outlines the exhaustive requirements, patterns, and best practices governing the platform.

---

## 📋 1. CORE SAAS & MULTI-TENANCY REQUIREMENTS

### 1.1 Data Isolation & Tenant Architecture
- ✅ **Strict Data Partitioning**: Every database record must be linked to an `organizationId` or `tenantId`.
- ✅ **Tenant-Aware Queries**: All database queries must filter by tenant ID via middleware or query scopes.
- ✅ **Shared Codebase, Isolated Data**: Single application instance serves all tenants with complete data separation.
- ✅ **Tenant Schema Strategy**: 
  - **Option A (Active Implementation)**: Single database, shared collections with `organizationId` index column.
  - **Option B**: Separate databases per tenant (higher isolation, complex maintenance).
- ✅ **Tenant Identifier**: Each tenant has a unique `organizationId` (UUID/ObjectId) and a human-readable `organizationSlug` (URL-friendly name).

### 1.2 Tenant Onboarding & Provisioning
- ✅ **Self-Service Signup**: Organizations can register and provision their workspace without manual intervention.
- ✅ **Tenant Configuration**: Each tenant can configure:
  - **Branding**: Primary color, secondary color, logo URL, favicon, slogan.
  - **Features**: Enable/disable specific modules (e.g., attendance, billing, outings).
  - **Settings**: Timezone, currency, date format, language.
- ✅ **Subscription Plans**: Tenants subscribe to different tiers (Basic, Pro, Enterprise) with varying feature access and usage limits.
- ✅ **Usage Limits**: Track and enforce limits (e.g., max students, max rooms, max staff accounts).

### 1.3 Tenant Context & Routing
- ✅ **Slug-Based Routing**: All routes are scoped under the tenant slug: `/organization/:organizationSlug/...`.
- ✅ **Tenant Context Provider**: Wraps the application to provide tenant-specific data (branding, settings, feature flags) to all child components.
- ✅ **Dynamic Branding**: CSS variables (`--tenant-primary`, `--tenant-secondary`) are injected into the DOM for theme customization.
- ✅ **Tenant Switching**: Super admin can switch between tenants for support and management purposes.

---

## 🔐 2. AUTHENTICATION & AUTHORIZATION (RBAC)

### 2.1 User Roles & Permissions (RBAC)
- ✅ **Role Hierarchy**: Strict hierarchy of roles with escalating permissions:
  - `super_admin`: Platform-level administration (can manage all tenants).
  - `admin`: Full control over a single organization.
  - `moderator`: Staff-level access with capability sub-types (`administration`, `discipline_monitor`, `attendance_only`, `security_guard`).
  - `student`: Basic access to own profile, outings, dues, leaves.
  - `security_guard`: Limited to gate-checking and outpass movement logging.
- ✅ **Permission Matrix**: Define granular permissions for each role (Create/Read/Update/Delete operations per module).

### 2.2 Authentication & Session Management
- ✅ **JWT-Based Authentication**: Secure, stateless authentication using JSON Web Tokens.
- ✅ **Refresh Token Rotation**: Implement refresh token mechanism for extended sessions.
- ✅ **Session Timeout**: Auto-logout after configured inactivity period.
- ✅ **Multi-Factor Authentication (MFA)**: Optional MFA support for admin roles.
- ✅ **Social Login**: Support for Google, GitHub, or other OAuth providers.

### 2.3 Route & API Protection
- ✅ **Protected Routes**: Frontend routes guarded with role-based access control (`SuperAdminGuard`, `ProtectedRoute`).
- ✅ **API Middleware**: Backend API endpoints validate user authentication and permissions (`auth.js`, `requireRole`).
- ✅ **Tenant Scoping**: Users can only access data for their assigned organization.
- ✅ **Super Admin Routes**: Special routes only accessible to super admins for platform management (`/super-admin`).

---

## 🏗️ 3. UI/UX & COMPONENT ARCHITECTURE

### 3.1 Layout & Navigation (Modern SPA Pattern)
- ✅ **`createBrowserRouter` + `RouterProvider`**: Modern React Router pattern.
- ✅ **Nested Layouts**: `RootLayout` (providers) → `AppLayout` (sidebar + header + outlet) → `Outlet` (page content).
- ✅ **Plug-and-Play Components**: Layout components are self-contained, zero-prop by default, consuming state and context internally.
- ✅ **Responsive Sidebar**: Collapsible navigation drawer with mobile-first design.
- ✅ **Sticky Header**: Top bar with branding, live network status, search, and user profile.

### 3.2 Design System & Styling
- ✅ **Tailwind CSS**: Utility-first CSS framework for rapid development.
- ✅ **Daisy UI**: Pre-built component library compatible with Tailwind for accelerated UI development.
- ✅ **Dark/Light Theme**: Support for dark and light themes with persistent user preference.
- ✅ **Tenant Theme Injection**: Dynamic CSS variables for tenant-branded theming.
- ✅ **Shimmer UI**: Skeleton loaders for all data-fetching states (not traditional spinners).

### 3.3 Reusable Component Library
- ✅ **`<Shimmer />`**: Skeleton placeholder for loading states.
- ✅ **`<EmptyState />`**: Standardized empty list fallback with icons.
- ✅ **`<SubmitButton />`**: Button with built-in loading spinner state.
- ✅ **`<GenderBadge />`**: Reusable badge for gender/type display.
- ✅ **`<SuperAdminGuard />`**: Route guard for platform administration.
- ✅ **`<ErrorBoundary />`**: Top-level error fallback for routing errors.

---

## 🔄 4. STATE MANAGEMENT & DATA LAYER

### 4.1 Global State (Redux Toolkit)
- ✅ **Centralized Store**: Single store for all application-wide UI state (`src/utils/store.ts`).
- ✅ **Slices per Concern**: Shared state slices (`src/utils/appSlice.ts`).
- ✅ **Narrow Selectors**: Subscribe only to specific slice properties to prevent unnecessary re-renders.
- ✅ **Typed Hooks**: `useAppDispatch` and `useAppSelector` for type-safe Redux usage.
- ✅ **Persistent State**: Persist critical state (theme, sidebar preference) to localStorage.

### 4.2 Custom Hooks Architecture (`src/hooks/`)
- ✅ **`useOnline`**: Tracks browser online/offline status with cleanup.
- ✅ **`useDebounce`**: Debounces search inputs for optimized API calls.
- ✅ **`useAuthUser`**: Provides memoized role accessors (`isAdmin`, `isStudent`, `isSecurityGuard`).
- ✅ **`useStudentsData`**: Container hook for student search, pagination, and API fetching.
- ✅ **`useTenant`**: Access tenant branding and configuration.

### 4.3 Data Fetching & Caching
- ✅ **Render-Fetch-Render Pattern**: Render UI first, fetch data, then update state.
- ✅ **Request Deduplication**: Prevent duplicate parallel API calls for the same resource.
- ✅ **Cache Management**: Cache responses with proper invalidation strategies.
- ✅ **Error Handling**: Centralized error handling with user-friendly messages (`getErrorMessage`).
- ✅ **Loading States**: Shimmer UI for all data-loading scenarios.

---

## 🗄️ 5. BACKEND & DATABASE REQUIREMENTS

### 5.1 Database Schema (MongoDB / Mongoose)
```typescript
// Base Multi-Tenant Schema Pattern
const BaseTenantSchema = {
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
};
```

### 5.2 Core Collections
- **Organizations**: Tenant metadata, branding, settings, subscription.
- **Users**: Authentication, roles, profile.
- **Students**: Student profiles, contact, documents, status.
- **Rooms**: Room types, capacity, availability.
- **Outings**: Outpass requests, approvals, gate logs.
- **Attendance**: Meal tracking, check-ins/check-outs.
- **Bills**: Invoices, payment tracking.
- **Flags**: Disciplinary flags, incident reports.

### 5.3 API Design (RESTful)
- ✅ **RESTful Endpoints**: Resource-based API design (`/api/students`, `/api/outings`).
- ✅ **Tenant Filtering**: All endpoints support `?organizationId=...` or use context middleware.
- ✅ **Pagination**: Large datasets support pagination (`?page=1&limit=20`).
- ✅ **Filtering & Sorting**: Advanced query parameters for flexible data retrieval.
- ✅ **Search**: Global search across multiple fields.
- ✅ **Proper HTTP Status Codes**: Use appropriate response codes (200, 201, 400, 401, 403, 404, 500).
- ✅ **Error Standardization**: Consistent error response format.

---

## 🔐 6. SECURITY & COMPLIANCE

### 6.1 Security Requirements
- ✅ **HTTPS Only**: Enforce HTTPS for all connections.
- ✅ **CORS Configuration**: Restrict allowed origins to known domains.
- ✅ **Input Validation**: Validate and sanitize all user inputs.
- ✅ **Rate Limiting**: Prevent abuse with per-user/per-IP rate limiting.
- ✅ **SQL/NoSQL Injection Protection**: Use ORM/ODM with parameterized queries.
- ✅ **XSS Prevention**: Sanitize user-generated content.
- ✅ **CSRF Protection**: Implement anti-CSRF tokens for state-changing operations.
- ✅ **Secure Headers**: Set security headers (HSTS, X-Frame-Options, etc.).

### 6.2 Data Privacy & Compliance
- ✅ **GDPR Ready**: Data deletion, export, and consent management.
- ✅ **Data Encryption**: Encrypt sensitive data at rest.
- ✅ **Audit Logs**: Track all critical actions for compliance.
- ✅ **Access Logging**: Log all authentication attempts and access.
- ✅ **Data Retention Policy**: Configurable data retention period.

### 6.3 Role-Based Data Visibility
- ✅ **Field-Level Security**: Users should only see data they're authorized to view.
- ✅ **Row-Level Security**: Database-level security based on tenant and role.
- ✅ **API Permission Validation**: Validate permissions on every API request.

---

## 📊 7. MONITORING & OBSERVABILITY

### 7.1 Logging
- ✅ **Structured Logging**: JSON-formatted logs for easier parsing.
- ✅ **Centralized Log Aggregation**: Send logs to a centralized service (ELK, Datadog, etc.).
- ✅ **Request/Response Logging**: Log all API requests and responses for debugging.
- ✅ **Error Logging**: Detailed stack traces and context for all errors.
- ✅ **Tenant-Aware Logging**: Logs include `organizationId` for tenant isolation.

### 7.2 Metrics & Monitoring
- ✅ **Application Performance Monitoring (APM)**: Track response times, error rates.
- ✅ **Infrastructure Monitoring**: CPU, memory, disk, network usage.
- ✅ **Usage Analytics**: Track DAU/MAU, feature adoption, tenant activity.
- ✅ **Custom Business Metrics**: Key metrics specific to the domain (e.g., outings approved, attendance rate).

### 7.3 Alerting
- ✅ **Error Alerts**: Immediate alerts for critical errors.
- ✅ **Performance Alerts**: Alert when response times exceed thresholds.
- ✅ **Uptime Monitoring**: Ensure application availability with proactive checks.

---

## 🧪 8. TESTING & QUALITY ASSURANCE

### 8.1 Testing Types
- ✅ **Unit Tests**: Test individual components, hooks, and utilities.
- ✅ **Integration Tests**: Test API endpoints and data flow.
- ✅ **Component Testing**: Test React components in isolation.
- ✅ **End-to-End Tests**: Test user flows across the entire application.
- ✅ **Performance Tests**: Load testing for peak traffic scenarios.

### 8.2 Quality Gates
- ✅ **Type Safety**: 100% strict TypeScript compliance (`tsc --noEmit` with **0 errors**).
- ✅ **Lint Checks**: ESLint with project-specific rules.
- ✅ **Test Coverage**: Maintain minimum coverage thresholds.
- ✅ **Build Verification**: Ensure builds succeed without errors (`npm run build` < 1.2s).

---

## 🚀 9. PERFORMANCE & SCALABILITY

### 9.1 Frontend Performance
- ✅ **Code Splitting**: Lazy load route-based chunks.
- ✅ **Bundle Optimization**: Keep bundle sizes minimal (Vite builds <1.2s).
- ✅ **Image Optimization**: Use CDN, proper formats, lazy loading.
- ✅ **Memoization**: Use `useMemo`, `useCallback`, `React.memo` for expensive operations.
- ✅ **Virtualization**: Virtual lists for large datasets.

### 9.2 Backend Performance
- ✅ **Database Indexing**: Proper indexes for all frequently queried fields (`organizationId`, `slug`, `email`).
- ✅ **Query Optimization**: Use projection, pagination, and selective field fetching.
- ✅ **Caching**: Redis caching for frequently accessed data.
- ✅ **Connection Pooling**: Efficient database connection management.
- ✅ **Background Processing**: Offload heavy tasks to background queues.

### 9.3 Scalability Considerations
- ✅ **Horizontal Scaling**: Support multiple application instances.
- ✅ **Database Read Replicas**: Offload read queries to replicas.
- ✅ **CDN**: Use CDN for static assets and images.
- ✅ **Microservices-Ready**: Design modules to eventually split into microservices.

---

## 📁 10. CODE ORGANIZATION & CONVENTIONS

### 10.1 File & Folder Naming (Strict)
| Category | Convention | Example |
|---|---|---|
| **React Components** | `PascalCase.tsx` | `StudentDetailPage.tsx` |
| **Custom Hooks** | `camelCase.ts` (starts with `use`) | `useOnline.ts` |
| **Redux Slices** | `camelCase.ts` (ends with `Slice`) | `appSlice.ts` |
| **Utility Functions** | `camelCase.ts` | `errorUtils.ts` |
| **Context Providers** | `kebab-case.tsx` | `auth-context.tsx` |

### 10.2 Directory Structure
```
client/src/
├── components/           # Reusable UI & Layout Components
│   ├── layout/           # AppLayout, Sidebar, Header, RootLayout
│   └── ui/               # Shimmer, EmptyState, SubmitButton, GenderBadge
├── core/                 # Core application logic
│   ├── context/          # AuthProvider, TenantProvider
│   └── lib/              # API client configuration
├── hooks/                # Custom React Hooks (camelCase, starting with `use`)
├── modules/              # Feature-Based Modules (camelCase)
│   ├── students/         # Students module
│   ├── rooms/            # Rooms module
│   └── outings/          # Outings module
├── utils/                # Redux store, constants, formatters
│   ├── store.ts
│   ├── appSlice.ts
│   └── constants.ts
└── App.tsx               # Router configuration ONLY
```

---

## 📊 11. BUSINESS PROCESS REQUIREMENTS (Campus Stay Specific)

### 11.1 Student Management
- ✅ Student registration with profile, documents, emergency contact.
- ✅ Room assignment and transfer tracking.
- ✅ Student status management (active, alumni, suspended).
- ✅ Bulk import/export via CSV.

### 11.2 Outing Management
- ✅ Outpass request submission with date/time, destination, purpose.
- ✅ Approval workflow with role-based routing (student → moderator → security).
- ✅ QR code generation for outpass verification.
- ✅ Gate entry/exit scanning.
- ✅ Late return tracking and penalty management.

### 11.3 Attendance & Dining
- ✅ Meal tracking (breakfast, lunch, dinner).
- ✅ QR code-based attendance.
- ✅ Guest meal management.
- ✅ Attendance reports and analytics.

### 11.4 Room Management
- ✅ Room inventory with type, capacity, amenities.
- ✅ Occupancy tracking.
- ✅ Room allocation and deallocation.
- ✅ Maintenance request tracking.

### 11.5 Billing & Payments
- ✅ Fee structure management.
- ✅ Invoice generation.
- ✅ Online payment integration (SBI Collect workflow).
- ✅ Late fee calculation.
- ✅ Payment history and receipts.

### 11.6 Flag & Discipline Management
- ✅ Incident reporting.
- ✅ Flag types: warning, fine, suspension.
- ✅ Appeal process.
- ✅ Flag history and resolution tracking.

---

## 🎯 12. DEVELOPMENT BEST PRACTICES

### 12.1 Code Quality
- ✅ **No Console Logs**: Remove all console.log statements before committing.
- ✅ **Error Handling**: Comprehensive error handling with user-friendly messages.
- ✅ **Code Comments**: Document complex logic and non-obvious decisions.
- ✅ **Code Reviews**: Mandatory peer reviews for all pull requests.

### 12.2 Git & Version Control
- ✅ **Meaningful Commit Messages**: Conventional commits format (`feat: add student search`).
- ✅ **Small, Logical Commits**: Each commit addresses a single concern.
- ✅ **Branching Strategy**: Feature branches from develop, main for production.
- ✅ **Semantic Versioning**: Follow semantic versioning for releases.

### 12.3 CI/CD Pipeline
- ✅ **Automated Tests**: Run tests on every PR.
- ✅ **Build Automation**: Automated build on every push.
- ✅ **Deployment Automation**: Automated deployment to staging/production.
- ✅ **Environment Management**: Clear separation between development, staging, and production.

---

## 📚 13. COMMUNICATION & COLLABORATION

### 13.1 Documentation
- ✅ **API Documentation**: OpenAPI/Swagger documentation for all endpoints.
- ✅ **Component Documentation**: Storybook or similar for UI components.
- ✅ **Architecture Decision Records (ADRs)**: Document major architectural decisions.
- ✅ **Setup Guide**: Comprehensive onboarding guide for new developers.
- ✅ **User Guides**: End-user documentation for feature usage.

### 13.2 Team Collaboration
- ✅ **Sprint Planning**: Regular sprint planning and retrospective sessions.
- ✅ **Daily Standups**: Quick sync to identify blockers.
- ✅ **Pair Programming**: Encourage for complex features.
- ✅ **Knowledge Sharing**: Regular tech talks and knowledge transfer sessions.

---

## 🎯 14. PRODUCT ROADMAP & EVOLUTION

### 14.1 Phase 1 (MVP)
- ✅ Core student management.
- ✅ Room management.
- ✅ Basic outings (approval workflow).
- ✅ Simple attendance.

### 14.2 Phase 2 (Growth)
- ✅ Billing & payments.
- ✅ Advanced outings (QR codes, gate scanning).
- ✅ Flags & discipline management.
- ✅ Reporting & analytics.

### 14.3 Phase 3 (Scale)
- ⬜ Mobile apps (iOS/Android).
- ⬜ Advanced automation.
- ⬜ AI-powered recommendations.
- ⬜ Multi-language support.

### 14.4 Phase 4 (Enterprise)
- ⬜ Whitelabeling.
- ⬜ Custom integrations (Slack, Teams).
- ⬜ Advanced analytics & insights.
- ⬜ API for third-party integrations.
