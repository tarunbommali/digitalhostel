---
name: backend-auth
description: >-
  Guide for JWT authentication, bcrypt password handling, session verification, and role-based access control (RBAC) in Express.
---

# Backend Authentication & Access Control

## Auth Flow
1. **User Login**:
   - Verify user existence by email/username and organization.
   - Compare password using `bcryptjs.compare(password, user.password)`.
   - Sign JWT with payload `{ id: user._id, role: user.role, organization: user.organization }`.
2. **Protecting Routes**:
   - Extract Bearer token from `Authorization` header.
   - Verify token signature via `jwt.verify(token, process.env.JWT_SECRET)`.
   - Attach decoded user payload to `req.user`.
3. **Role Checks**:
   - Use role middleware to restrict routes by role (e.g. `requireRole(['SuperAdmin', 'Admin'])`).
