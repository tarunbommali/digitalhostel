---
name: react-testing
description: >-
  Unit and integration testing patterns for React components, hooks, and Redux slices.
---

# React Testing Guide

## Testing Principles
1. **Component Testing**:
   - Render components with required context wrappers (e.g. Redux Provider, Router).
   - Query elements by accessible roles and text labels (`screen.getByRole`, `screen.getByText`).
2. **Hook Testing**:
   - Use `renderHook` from `@testing-library/react` to test custom hook state changes.
3. **Mocking Network Calls**:
   - Mock API responses with realistic payloads.
