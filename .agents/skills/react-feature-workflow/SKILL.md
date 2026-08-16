---
name: react-feature-workflow
description: >-
  End-to-end workflow for adding a new UI module, page, or dashboard feature in the React frontend.
---

# Frontend Feature Development Workflow

## Step-by-Step Implementation
1. **Define Feature Directory**:
   - Create feature directory under `client/src/modules/<feature-name>/`.
2. **Define TypeScript Types & API Services**:
   - Create interface definitions matching backend model/response shapes.
   - Define API fetch functions with authorization token passing.
3. **Build UI Components**:
   - Build sub-components (filters, tables, summary cards, action dialogs).
4. **Wire Route & Navigation**:
   - Add route in `client/src/App.tsx` protected by role guard if necessary.
   - Add navigation item in sidebar/header navigation config.
5. **Add User Feedback**:
   - Verify validation errors, loading spinners, and toast confirmations.
