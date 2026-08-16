---
name: backend-overview
description: >-
  Provides the architecture, request flow, and directory conventions for the Digital Hostel Node.js/Express/MongoDB backend.
---

# Digital Hostel Backend Overview

## Architecture & Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose
- **Auth**: JWT Bearer / Header tokens & bcryptjs
- **Multi-Tenancy**: Organization-scoped data models

## Directory Structure
```
server/
├── index.js          # App initialization, CORS, JSON body parser, route registration
├── db.js             # MongoDB connection logic
├── middleware/       # Auth (verifyToken, requireRole, checkTenant)
├── models/           # Mongoose schemas (Student, User, Room, BedAllocation, MonthlyBill, etc.)
├── routes/           # REST API endpoints (students.js, rooms.js, bills.js, auth.js, etc.)
├── services/         # Business logic and calculators
└── utils/            # Shared helpers & formatters
```

## Request Flow
```
Client Request → Express index.js → CORS/JSON Middleware → Auth & Role Middleware → Route Handler (routes/*.js) → Mongoose Model (models/*.js) → MongoDB → Structured JSON Response
```
