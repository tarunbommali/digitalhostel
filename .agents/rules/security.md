# Security & Access Control Guidelines

## Authentication & Authorization
1. **Password Security**:
   - Always hash passwords with `bcryptjs` using a salt work factor of at least 10 before saving to MongoDB.
   - Never accept or compare plaintext passwords directly.
2. **JWT Handling**:
   - Store JWT secret securely in environment variables (`JWT_SECRET`).
   - Sign JWT tokens with an appropriate expiration (e.g. `7d` or `24h`).
   - Validate token signatures in auth middleware and attach decoded user payload to `req.user`.
3. **Role-Based Access Control (RBAC)**:
   - System Roles: `SuperAdmin`, `OrgAdmin` / `Admin`, `Moderator` / `Warden`, `Student`.
   - Protect sensitive routes with role-check middleware (e.g. `verifyRole(['SuperAdmin', 'Admin'])`).
   - SuperAdmin routes must only manage organizations and system-wide configurations.

## Input Validation & Sanitization
1. **Request Body Whitelisting**:
   - Explicitly validate and sanitize `req.body` and `req.params`.
   - Disallow updates to protected fields (such as `_id`, `role`, `organization`, `passwordHash`) via generic update endpoints.
2. **Injection & Query Safety**:
   - Use Mongoose parameterized queries to prevent NoSQL injection.
   - Sanitize regular expressions when building search queries from user input.
3. **CORS & Environment Configurations**:
   - Configure CORS origins to only allow authorized frontend origins in production.
   - Never commit `.env` files with production secrets to version control.
