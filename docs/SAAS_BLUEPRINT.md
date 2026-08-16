# 🏗️ Inside Home - SaaS Product Requirements & Naming Blueprint

Comprehensive breakdown of core SaaS multi-tenancy requirements, component names, page modules, variable names, and architectural standards for the **Inside Home** hostel management platform.

---

## 🏢 1. Core SaaS & Multi-Tenancy Requirements

### 1.1 Multi-Tenancy (Isolation & Branding)
- **Requirement:** Support multiple independent organizations (e.g. "Skyline Hostel", "Green Valley PG") within a single codebase and infrastructure.
- **Implementation:**
  - Database records link to `organizationId`.
  - Frontend organization routes scope under `/organization/:organizationSlug/...` (e.g. `organization/skyline-luxury/dashboard`).
  - Dynamic branding (`primaryColor`, `logoUrl`) dynamically injects theme variables (`--tenant-primary`, `--tenant-secondary`) into the DOM.
- **Key Variables:**
  ```typescript
  const organizationId: string;       // Unique ID for the tenant organization
  const organizationSlug: string;     // URL-friendly name (e.g. "skyline-luxury")
  const tenantBranding = {
    primaryColor: string,
    secondaryColor?: string,
    logoUrl: string,
    tagline?: string,
  };
  ```

---

### 1.2 Role-Based Access Control (RBAC)
- **Requirement:** Strict feature and route authorization based on user roles.
- **User Roles Hierarchy:**
  1. `super_admin`: Platform-level administration.
  2. `admin`: Full control over a single organization.
  3. `moderator`: Staff-level access with granular capability sub-types (`administration`, `discipline_monitor`, `attendance_only`, `security_guard`).
  4. `student`: Basic student portal access (digital pass, outings, dues, leaves).
  5. `security_guard`: Gate outpass scanner and movement log access.
- **Implementation:**
  - Backend middleware validates permissions (`requireRole`, `requireModeratorType`).
  - Frontend layout guards check allowed roles (`SuperAdminGuard`).

---

### 1.3 Data Privacy & Isolation
- **Requirement:** Data from one organization must never bleed into another.
- **Implementation:**
  - Backend Mongoose queries always enforce `{ organizationId }` filter.
  - Frontend data fetching hooks (`useStudentsData`) derive organization scope automatically from `TenantContext`.

---

## 📁 2. Project Structure & Naming Conventions

### 2.1 Directory Structure
The project follows a strict, modular, and feature-based folder structure:

```
client/src/
├── components/           # Reusable UI & Layout Components
│   ├── layout/           # AppLayout, Sidebar, Header, RootLayout, ErrorBoundary
│   └── ui/               # Shimmer, EmptyState, SubmitButton, GenderBadge
├── core/                 # Core application context & API client
│   ├── context/          # AuthProvider (auth-context.tsx), TenantProvider (tenant-context.tsx)
│   └── lib/              # api.ts, utils.ts
├── hooks/                # Custom React Hooks (camelCase, starting with `use`)
│   ├── useOnline.ts
│   ├── useDebounce.ts
│   ├── useAuthUser.ts
│   └── useStudentsData.ts
├── modules/              # Feature-Based Modules (camelCase)
│   ├── students/         # Students directory module
│   ├── rooms/            # Rooms & block management module
│   ├── outings/          # Gate outing logbook module
│   ├── attendance/       # Mess attendance scanner module
│   ├── moderators/       # Staff & warden management module
│   ├── leaves/           # Student leave applications module
│   ├── bills/            # Monthly billing module
│   ├── payments/         # SBI Collect payments module
│   └── dashboard/        # Organization dashboard module
├── utils/                # Redux store, constants, formatters
│   ├── store.ts
│   ├── appSlice.ts
│   ├── constants.ts
│   ├── errorUtils.ts
│   └── formatters.ts
├── App.tsx               # Router configuration ONLY (createBrowserRouter)
└── main.tsx              # Application entry point
```

---

### 2.2 File Naming Rules (Strict)
- **React Components:** `PascalCase.tsx` (e.g. `Sidebar.tsx`, `Header.tsx`, `EmptyState.tsx`)
- **Custom Hooks:** `camelCase.ts` starting with `use` (e.g. `useOnline.ts`, `useDebounce.ts`)
- **Redux Slices:** `camelCase.ts` ending with `Slice` (e.g. `appSlice.ts`)
- **Utility Functions:** `camelCase.ts` (e.g. `errorUtils.ts`, `formatters.ts`)

---

## 🧩 3. React Components & Pages Blueprint

### 3.1 Page-Level Components (Feature Modules)
Main application views residing in `src/modules/`:

| Component Name | File Path | Description |
|---|---|---|
| `<StudentsPage />` | `modules/students/pages/Students.tsx` | Main view for managing students (list, search, filter, add). |
| `<StudentDetailPage />` | `modules/students/pages/StudentDetail.tsx` | Detailed view/edit page for an individual student. |
| `<RoomsPage />` | `modules/rooms/pages/Rooms.tsx` | View for managing hostel blocks, rooms, and bed allocations. |
| `<OutingsPage />` | `modules/outings/pages/OutingsLog.tsx` | Main view for gate outpass logbook and movement filtering. |
| `<AttendancePage />` | `modules/attendance/pages/Attendance.tsx` | View for marking and scanning mess meal attendance. |
| `<ModeratorsPage />` | `modules/moderators/pages/Moderators.tsx` | View for managing staff, warden, and security guard accounts. |
| `<DashboardPage />` | `modules/dashboard/pages/AdminDashboard.tsx` | Main dashboard view for an organization. |

---

### 3.2 Layout Components (Reusable)
Skeletal layout primitives residing in `components/layout/`:

| Component Name | File Path | Description |
|---|---|---|
| `<RootLayout />` | `components/layout/RootLayout.tsx` | Top-most provider wrapper (Redux `<Provider>`, `AuthProvider`, `TenantProvider`, `<Toaster />`). |
| `<AppLayout />` | `components/layout/AppLayout.tsx` | Core authenticated layout with `<Sidebar />`, `<Header />`, and `<Outlet />`. |
| `<Sidebar />` | `components/layout/Sidebar.tsx` | Plug-and-play navigation drawer; self-contained, zero-prop. |
| `<Header />` | `components/layout/Header.tsx` | Top sticky navigation bar with tenant branding and `useOnline()` connectivity badge. |
| `<SuperAdminGuard />` | `components/layout/SuperAdminGuard.tsx` | Guards platform super admin routes. |
| `<ErrorBoundary />` | `components/layout/ErrorBoundary.tsx` | Router fallback for uncaught component errors. |

---

### 3.3 UI Components (Reusable Primitives)
Building block primitives residing in `components/ui/`:

| Component Name | File Path | Description |
|---|---|---|
| `<Shimmer />` | `components/ui/Shimmer.tsx` | Skeleton loader component (`ShimmerCard`, `ShimmerTableRows`). |
| `<EmptyState />` | `components/ui/EmptyState.tsx` | Standardized empty state indicator with customizable icons. |
| `<SubmitButton />` | `components/ui/SubmitButton.tsx` | Action button with built-in loading spinner logic. |
| `<GenderBadge />` | `components/ui/GenderBadge.tsx` | Reusable badge displaying hostel gender type (`Boys`, `Girls`, `Co-Ed`). |

---

## ⚡ 4. State Management & Hooks Paradigm

### 4.1 Global State (Redux Toolkit)
- **Store Configuration:** [`src/utils/store.ts`](file:///c:/Users/Tarun/Downloads/DigitalHostel/client/src/utils/store.ts)
- **Shared UI Slice:** [`src/utils/appSlice.ts`](file:///c:/Users/Tarun/Downloads/DigitalHostel/client/src/utils/appSlice.ts)
- **Constants:** [`src/utils/constants.ts`](file:///c:/Users/Tarun/Downloads/DigitalHostel/client/src/utils/constants.ts)

```typescript
export const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";
```

---

### 4.2 Custom Hooks Architecture (`src/hooks/`)

| Hook Name | File Path | Purpose |
|---|---|---|
| `useOnline` | `hooks/useOnline.ts` | Real-time browser online/offline status tracking. |
| `useDebounce` | `hooks/useDebounce.ts` | Search input debouncing to delay network requests. |
| `useAuthUser` | `hooks/useAuthUser.ts` | Memoized user role accessors (`isAdmin`, `isStudent`, `isSecurityGuard`). |
| `useStudentsData` | `hooks/useStudentsData.ts` | Container hook managing student search, pagination, and API fetching. |

---

### 4.3 Context Providers (`src/core/context/`)

| Provider Name | File Path | Purpose |
|---|---|---|
| `<AuthProvider />` | `core/context/auth-context.tsx` | Auth state management (`signIn`, `signOut`, user session). |
| `<TenantProvider />` | `core/context/tenant-context.tsx` | Organization metadata fetching and dynamic CSS variable injection. |

---

## 🛠️ 5. API & Utility Layer

### 5.1 API Endpoints Registry
All backend API routes are registered in `src/utils/constants.ts`:

```typescript
export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/auth`,
  STUDENTS: `${API_BASE_URL}/students`,
  ROOMS: `${API_BASE_URL}/rooms`,
  ATTENDANCE: `${API_BASE_URL}/attendance`,
  OUTINGS: `${API_BASE_URL}/outings`,
  LEAVES: `${API_BASE_URL}/leaves`,
  BILLS: `${API_BASE_URL}/bills`,
  PAYMENTS: `${API_BASE_URL}/payments`,
  FLAGS: `${API_BASE_URL}/flags`,
  ORGANIZATIONS: `${API_BASE_URL}/organizations`,
};
```

---

### 5.2 Utility Functions

| Utility Function | File Path | Purpose |
|---|---|---|
| `getErrorMessage(err, fallback)` | `utils/errorUtils.ts` | Standardized API error message extraction. |
| `formatPhoneNumber(phone, countryCode)` | `utils/formatters.ts` | Formats raw phone strings into readable phone numbers. |
| `capitalize(str)` | `utils/formatters.ts` | Capitalizes text strings. |
| `truncateText(text, maxLength)` | `utils/formatters.ts` | Truncates text with ellipses. |
