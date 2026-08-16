# Global Coding Standards & Engineering Principles

## Core Principles
1. **Clean Code**: Write self-documenting code with clear variable and function names. Avoid cryptic abbreviations.
2. **SOLID Principles**: Enforce Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion across all architectural layers.
3. **Separation of Concerns**:
   - Routes: Handle HTTP request parsing, status codes, and delegation.
   - Middlewares: Handle cross-cutting concerns (authentication, authorization, request validation, logging).
   - Services / Models: Handle core business logic, calculations, and database interactions.
   - Frontend UI: Separation of presentation (dumb components) from data fetching/business logic (hooks/containers).
4. **DRY & Single Source of Truth**: Reusable constants, enums (e.g. User Roles, Attendance Statuses, Payment Methods), and utilities must be defined once and imported.

## API Design & Error Conventions
- HTTP Status Codes:
  - `200 OK`: Successful retrieval or update.
  - `201 Created`: Successful resource creation.
  - `400 Bad Request`: Validation failure or malformed payload.
  - `401 Unauthorized`: Missing or invalid authentication token.
  - `403 Forbidden`: Authenticated user lacks permission for the resource.
  - `404 Not Found`: Target resource does not exist.
  - `409 Conflict`: Duplicate entry or conflicting state.
  - `500 Internal Server Error`: Unhandled server exception.

## Code Quality & Linters
- Ensure TypeScript files in `client/` pass `eslint` and `tsc` type checking without errors.
- Do not commit dead code, console logs in critical paths, or hardcoded secrets.
- Preserve existing comments and docstrings unless explicitly updating logic.
