# 🏗️ Inside Home - Naming Conventions & Code Style Guide

Comprehensive naming standards and project file organization conventions for the Inside Home multi-tenant hostel management codebase.

---

## 📁 1. Project Directory & File Naming Conventions

### 1.1 Directory Tree Structure

```
client/src/
├── components/           # Reusable UI & Layout Components (PascalCase)
│   ├── layout/           # AppLayout, Sidebar, Header, RootLayout, ErrorBoundary
│   └── ui/               # Shimmer, EmptyState, SubmitButton, GenderBadge, Button
├── hooks/                # Custom React Hooks (camelCase starting with `use`)
│   ├── useOnline.ts
│   ├── useDebounce.ts
│   ├── useAuthUser.ts
│   └── useStudentsData.ts
├── utils/                # Redux store, constants, formatters, error utilities
│   ├── store.ts
│   ├── appSlice.ts
│   ├── constants.ts
│   ├── errorUtils.ts
│   └── formatters.ts
├── modules/              # Feature Page Modules (camelCase folders)
│   ├── students/         # pages/ & components/
│   ├── rooms/            # pages/ & components/
│   ├── outings/          # pages/ & components/
│   ├── attendance/       # pages/ & components/
│   └── moderators/       # pages/ & components/
├── core/                 # Shared core contexts, API client & UI primitives
│   ├── context/          # auth-context.tsx, tenant-context.tsx
│   ├── lib/              # api.ts, utils.ts
│   └── components/       # Core UI components
├── App.tsx               # Router configuration ONLY
└── main.tsx              # Application entry point
```

---

### 1.2 File Naming Rules

| Category | File Naming Convention | Example File Path |
|---|---|---|
| **React Components** | `PascalCase.tsx` | `src/components/layout/Sidebar.tsx` |
| **Custom Hooks** | `camelCase.ts` (starts with `use`) | `src/hooks/useDebounce.ts` |
| **Redux Slices** | `camelCase.ts` (ends with `Slice`) | `src/utils/appSlice.ts` |
| **Utility Functions** | `camelCase.ts` | `src/utils/errorUtils.ts` |
| **Context Providers** | `kebab-case.tsx` or `PascalCase.tsx` | `src/core/context/auth-context.tsx` |
| **Constants & Config** | `camelCase.ts` | `src/utils/constants.ts` |

---

## 🎯 2. Variable & Function Naming Standards

### 2.1 Multi-Tenancy & Auth Identifiers

```typescript
// ✅ Recommended: Clear, explicit naming
const organizationId = "org_67890";
const organizationSlug = "skyline-luxury";
const userRole: AppRole = "admin";
const moderatorType: ModeratorType = "administration";

// ❌ Avoid: Ambiguous or non-standard casing
const org = "skyline";        // Ambiguous - slug or object?
const oId = "67890";          // Non-descriptive
const role_name = "admin";    // Use camelCase in TypeScript
```

---

### 2.2 Custom Hooks Naming

All custom hooks must reside in `src/hooks/` and start with the `use` prefix:

```typescript
// ✅ Recommended: Reusable custom hooks
import { useOnline } from "@/hooks/useOnline";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useStudentsData } from "@/hooks/useStudentsData";

// ❌ Avoid: Custom hooks without 'use' prefix or misplaced in view files
function debounceQuery(q: string) { ... }
```

---

### 2.3 Redux Toolkit (RTK) Naming

- **Slice Names**: Named by concern in singular camelCase (e.g. `name: "app"` in `appSlice.ts`).
- **Actions**: Verb-noun camelCase (e.g. `toggleMenu`, `openMenu`, `closeMenu`, `setSearchQuery`).
- **Typed Hooks**: `useAppDispatch` for dispatching actions and `useAppSelector` for accessing slice state.

```typescript
// Reading state with narrow selector
const isMenuOpen = useAppSelector((state) => state.app.isMenuOpen);

// Dispatching actions
const dispatch = useAppDispatch();
dispatch(closeMenu());
```

---

## 🎨 3. UI Component & Utility Function Naming

### 3.1 Utility UI Components

| Utility Component | Purpose | Usage Example |
|---|---|---|
| `<EmptyState />` | Renders clean empty data feedback | `<EmptyState message="No students found" icon={Users} />` |
| `<SubmitButton />` | Action button with loading spinner | `<SubmitButton loading={busy} icon={Plus}>Add Block</SubmitButton>` |
| `<GenderBadge />` | Hostel type badge | `<GenderBadge gender={b.gender} />` |
| `<Shimmer />` | Skeleton loader placeholder UI | `<ShimmerCard />` or `<ShimmerTableRows rows={5} />` |

---

### 3.2 Utility Functions

```typescript
// Error parsing utility
import { getErrorMessage } from "@/utils/errorUtils";
toast.error(getErrorMessage(err, "Failed to load students"));

// Data formatters
import { capitalize, formatPhoneNumber, truncateText } from "@/utils/formatters";
const formattedPhone = formatPhoneNumber(student.phone);
const cleanTitle = capitalize(block.gender);
```

---

## 🗄️ 4. Backend Database Schema Naming

### Mongoose Collection & Field Standards

```typescript
// Base Multi-Tenant Schema Pattern
const BaseTenantSchema = {
  // Primary tenant reference (required on all collections)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  
  // Metadata & Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Status Flags
  isActive: { type: Boolean, default: true },
};
```
