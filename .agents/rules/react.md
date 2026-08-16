# React & Frontend Guidelines (Digital Hostel)

## Technology Stack
- **Framework**: React 19 with Vite and TypeScript.
- **Styling**: Tailwind CSS v4, Lucide React icons, Radix UI primitives, `clsx`, `tailwind-merge` (`cn` helper).
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) for global shared state, React Context for theme/auth session, React Hooks (`useState`, `useReducer`, `useMemo`, `useCallback`) for local UI state.
- **Routing**: `react-router-dom` (v6).
- **Forms & Validation**: `react-hook-form` + `@hookform/resolvers` + `zod`.
- **Data Visualizations & Tables**: `recharts`, `lucide-react`, `sonner` for toast notifications.

## Component Architecture & Standards
1. **Functional Components Only**: Use functional components with TypeScript interfaces for props. Never use class components.
2. **File Naming & Structure**:
   - Component files: PascalCase (e.g. `StudentCard.tsx`, `RoomAllocationModal.tsx`).
   - Hooks: camelCase starting with `use` (e.g. `useDebounce.ts`, `useAuth.ts`).
   - Utilities/helpers: camelCase (e.g. `store.ts`, `api.ts`, `utils.ts`).
3. **Props & Types**:
   - Explicitly type all component props using TypeScript `interface` or `type`.
   - Avoid `any`. Use strict domain models and generics where appropriate.
4. **Design & Aesthetics**:
   - Maintain rich, modern, responsive aesthetics using dark/light mode tokens and Tailwind utility classes.
   - Use the `cn(...)` utility helper to merge conditional classes and avoid duplicate Tailwind definitions.
   - Use Radix UI primitives for accessible dropdowns, dialogs, popovers, accordions, and tabs.
5. **State Management Ladder**:
   - **Local UI State**: Use `useState` or `useReducer` for inputs, dropdown toggles, modal open states.
   - **Custom Hooks**: Extract stateful logic, debounce routines, and window event listeners into reusable hooks under `client/src/hooks/` or `client/src/utils/`.
   - **Global Redux Store**: Store cross-cutting entities (current authenticated user, active tenant/organization, notifications, global filters) in slices under `client/src/core/` or `client/src/modules/`.
6. **Error Handling & Feedback**:
   - Always display user-friendly loading skeletons/spinners during async operations.
   - Use Sonner toast alerts for success and error messages on user actions.
   - Gracefully handle empty states with clean illustrations or informational prompts.
