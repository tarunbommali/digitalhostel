# Node.js + Express + Mongoose Backend Rules (Digital Hostel)

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs password hashing
- **Module System**: CommonJS (`require` / `module.exports`)

## Architecture & Directory Structure
The server follows a clean, modular structure under `server/`:
```
server/
├── index.js          # Express app configuration, middleware initialization, route mounting
├── db.js             # Mongoose connection logic with retry & error handling
├── middleware/       # Shared middleware (auth, verifyRole, validateTenant, errorHandler)
├── models/           # Mongoose schemas & models (User, Student, Room, BedAllocation, etc.)
├── routes/           # REST API endpoints organized by domain resource
├── services/         # Domain business logic, billing calculators, audit loggers
└── utils/            # Helper utilities, validators, response formatters
```

## Backend Coding Rules
1. **Router-Per-Resource**:
   - Every domain resource must have its own router file in `server/routes/` (e.g. `students.js`, `rooms.js`, `bills.js`, `auth.js`).
   - Mount routes cleanly in `server/index.js` or via route indexer.
2. **Controller & Async Error Handling**:
   - Always wrap async route handlers in `try...catch` blocks or an async error wrapper.
   - Return structured error responses: `res.status(code).json({ success: false, message: '...', error: ... })`.
   - Never leak internal database stack traces to the client in production.
3. **Mongoose Models & Schemas**:
   - Model files must be singular PascalCase (e.g. `Student.js`, `BedAllocation.js`, `MonthlyBill.js`).
   - Define explicit types, `required`, `trim`, `default`, and `enum` validations directly in schema definitions.
   - Use compound indexes for multi-tenant queries (e.g., `{ organization: 1, rollNumber: 1 }`).
   - When updating documents with `findOneAndUpdate` or `findByIdAndUpdate`, always specify `{ new: true, runValidators: true }`.
4. **Data Isolation & Multi-Tenancy**:
   - Scope all database queries, mutations, and aggregate pipelines by `organization` / tenant ID to prevent cross-tenant data leakage.
   - Enforce organization context through the authentication middleware (`req.user.organization`).
5. **Clean API Response Envelope**:
   - Standardize responses across all endpoints:
     ```json
     {
       "success": true,
       "message": "Operation completed successfully",
       "data": { ... }
     }
     ```
   - Strip sensitive fields (e.g., `password`, `__v`) before returning user data.
