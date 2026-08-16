# 🏢 Campus Stay - Design Principles & System Architecture Guide

Comprehensive architecture, UI/UX guidelines, state management patterns, and software principles for the Campus Stay multi-tenant hostel management platform.

---

## 📐 1. Core Architecture & Multi-Tenancy Principles

### 1.1 Multi-Tenancy First Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN LAYER                        │
│  - Organization Provisioning & Management                   │
│  - Subscription Plans & Workspace Limits                    │
│  - Platform Analytics & Tenant Health Audits                │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Organization │   │  Organization │   │  Organization │
│   (Slug A)    │   │   (Slug B)    │   │   (Slug C)    │
│  - Branding   │   │  - Branding   │   │  - Branding   │
│  - Users      │   │  - Users      │   │  - Users      │
│  - Students   │   │  - Students   │   │  - Students   │
│  - Outings    │   │  - Outings    │   │  - Outings    │
└───────────────┘   └───────────────┘   └───────────────┘
```

**Principle**: Strict data isolation between tenant organizations while sharing a unified codebase and infrastructure.

**Implementation**:
- **Backend Isolation**: Every database query filters by `organizationId` via middleware.
- **Frontend Isolation**: Organization routes are scoped under `/organization/:slug/*`.
- **Tenant Context**: `TenantProvider` dynamically loads branding metadata (`primaryColor`, `logoUrl`) and injects tenant CSS variables (`--tenant-primary`, `--tenant-secondary`).

---

### 1.2 Role-Based Access Control (RBAC) Hierarchy

```typescript
// App Role Hierarchy (Highest to Lowest Privilege)
export type AppRole =
  | "super_admin"     // Platform Level
  | "admin"           // Organization Admin Level
  | "moderator"       // Staff Level
  | "student"         // Student Portal Level
  | "security_guard"; // Gate Control Level

// Moderator Capability Sub-Types
export type ModeratorType =
  | "full"                // Full administration privileges
  | "administration"      // Student directory & room management
  | "discipline_monitor"  // Discipline flags & incident reports
  | "attendance_only"     // Dining hall / mess attendance
  | "security_guard";     // Outpass gate scanner
```

**Principle**: Principle of Least Privilege - users access only the routes and features permitted for their active role.

**Implementation**:
- `ProtectedRoute` component guards organization routes and validates `allowedRoles`.
- `useAuthUser()` custom hook exposes memoized role accessors (`isAdmin`, `isModerator`, `isStudent`, `isSecurityGuard`).

---

## 🎨 2. UI/UX & React Component Architecture

### 2.1 Modern Layout & Router Composition (`createBrowserRouter`)

The application uses React Router's modern `createBrowserRouter` + `RouterProvider` pattern with nested layout `<Outlet />` wrappers.

```
src/
├── App.tsx                     # Router configuration ONLY (createBrowserRouter)
├── main.tsx                    # Minimal application entry point
├── components/
│   ├── layout/
│   │   ├── RootLayout.tsx      # Provider container (Redux Provider, Auth, Tenant, Toaster)
│   │   ├── AppLayout.tsx       # Main layout composition with Sidebar + Header + <Outlet />
│   │   ├── Sidebar.tsx         # Plug-and-play reusable navigation drawer
│   │   ├── Header.tsx          # Sticky top bar with live network connectivity badge
│   │   ├── SuperAdminGuard.tsx # Access guard for platform super admin routes
│   │   └── ErrorBoundary.tsx   # Top-level router error boundary fallback
│   └── ui/
│       ├── Shimmer.tsx         # Namaste React skeleton loader UI
│       ├── EmptyState.tsx      # Reusable empty data fallback component
│       ├── SubmitButton.tsx    # Button with built-in loading spinner logic
│       └── GenderBadge.tsx     # Reusable hostel type badge
```

---

### 2.2 Reusable Plug-and-Play Components

Layout components like `<Sidebar />` and `<Header />` are self-contained and zero-prop by default. They consume Redux state, Router hooks, and Context providers internally:

```tsx
// Clean, declarative layout composition in AppLayout.tsx
export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

---

## 🔄 3. State Management & Hooks Paradigm

### 3.1 Global Shared State (Redux Toolkit)

Redux Toolkit (`@reduxjs/toolkit` + `react-redux`) handles shared application-wide UI states:

- **Store**: `src/utils/store.ts` exporting typed `useAppDispatch` and `useAppSelector` hooks.
- **Slice**: `src/utils/appSlice.ts` managing drawer state (`isMenuOpen`), active search queries, and global UI filters.
- **Precision Selectors**: Components subscribe to narrow slice properties to avoid unnecessary re-renders (e.g. `useAppSelector((state) => state.app.isMenuOpen)`).

---

### 3.2 Custom Hooks Architecture (`src/hooks/`)

Namaste React style custom hooks encapsulate state logic and browser APIs into clean, reusable abstractions:

| Hook Name | File Location | Purpose & Responsibility |
|---|---|---|
| `useOnline` | `src/hooks/useOnline.ts` | Tracks real-time browser online/offline network connectivity state. |
| `useDebounce` | `src/hooks/useDebounce.ts` | Delays search query state updates to optimize API requests during user typing. |
| `useAuthUser` | `src/hooks/useAuthUser.ts` | Exposes memoized user role flags (`isAdmin`, `isStudent`, `isSecurityGuard`). |
| `useStudentsData` | `src/hooks/useStudentsData.ts` | Container hook managing student search, pagination, lookups, and API fetching. |

---

### 3.3 Context Optimization (`useMemo`, `useCallback`, `useRef`)

Context providers ([`AuthProvider`](file:///c:/Users/Tarun/Downloads/DigitalHostel/client/src/core/context/auth-context.tsx), [`TenantProvider`](file:///c:/Users/Tarun/Downloads/DigitalHostel/client/src/core/context/tenant-context.tsx)) follow strict optimization techniques:

1. **`useMemo` Context Value**: Provider `value` objects are memoized to eliminate cascade re-renders across descendant components.
2. **`useCallback` Function Stability**: Async API actions (`signIn`, `signOut`, `fetchTenantBySlug`) have stable function identities.
3. **`useRef` Mount Guards**: `isMountedRef` prevents state mutations on unmounted components after async API resolution.
4. **`useRef` Request Deduplication**: `inFlightRequestsRef` caches active network promises to prevent duplicate parallel API calls for the same organization slug.

---

## 🧰 4. Utility Layer & Error Handling

### 4.1 Centralized Constants & Endpoints
All API endpoint URLs are maintained in [`src/utils/constants.ts`](file:///c:/Users/Tarun/Downloads/DigitalHostel/client/src/utils/constants.ts):

```typescript
export const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

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

### 4.2 Utility Functions & UI Fallbacks
- **`getErrorMessage(err, fallback)`**: Standardized error extractor located in `src/utils/errorUtils.ts`.
- **`formatPhoneNumber(phone, countryCode)`**: Phone number formatter in `src/utils/formatters.ts`.
- **`<EmptyState />`**: Standardized empty list placeholder with icons in `src/components/ui/EmptyState.tsx`.
- **`<SubmitButton />`**: Button with built-in loading spinner in `src/components/ui/SubmitButton.tsx`.
- **`<Shimmer />`**: Skeleton placeholder UI in `src/components/ui/Shimmer.tsx`.

---

## 🚀 5. Performance & Build Verification Checklist

- **Build Speed**: Minified production compilation built with Vite (<1.2s build time).
- **Type Safety**: 100% strict TypeScript compliance checked via `npx tsc --noEmit` (**0 errors**).
- **Code Cleanliness**: Zero leftover `console.log` statements in committed source files.
