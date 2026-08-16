---
name: react-state-management
description: >-
  State management decision ladder between local useState/useReducer, React Context, and Redux Toolkit slices.
---

# React State Management Decision Guide

## State Hierarchy
1. **Local State (`useState` / `useReducer`)**:
   - Modal visibility (`isOpen`)
   - Form input transient state
   - Active tab index
2. **Context API**:
   - Theme provider (Light / Dark mode)
   - Toast notification context
3. **Redux Toolkit (`client/src/utils/store.ts` or slices in `modules/`)**:
   - Current logged-in user profile and permissions
   - Active organization / hostel branch metadata
   - Global dashboard filters and cached lists
