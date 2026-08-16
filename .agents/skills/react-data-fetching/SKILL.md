---
name: react-data-fetching
description: >-
  Data fetching patterns, loading skeletons, error boundaries, debouncing search inputs, and caching strategies.
---

# React Data Fetching & API Integration

## Best Practices
1. **Debounced Search Inputs**:
   - Use `useDebounce` hook for live search and filter fields to prevent flooding the backend with HTTP requests.
2. **Loading & Error States**:
   - Always track `loading`, `error`, and `data` states.
   - Render skeleton loaders rather than shifting UI layout abruptly.
3. **Toast Notifications for Mutations**:
   - Use `sonner` (`toast.success(...)`, `toast.error(...)`) to give instant feedback on form submissions and status changes.
