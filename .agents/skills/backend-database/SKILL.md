---
name: backend-database
description: >-
  Mongoose schema design, indexing, multi-tenant querying, pagination, and aggregation patterns for MongoDB.
---

# Backend Database & Mongoose Guide

## Schema Conventions
- Singular model naming (e.g. `Student`, `Room`, `BedAllocation`, `MonthlyBill`).
- Include `{ timestamps: true }` on stateful schemas.
- Index foreign key references (`organization`, `student`, `room`, `academicYear`).

## Query Patterns
1. **Tenant Isolation**:
   Always filter queries by `organization`:
   ```javascript
   const students = await Student.find({ organization, status: 'Active' })
     .populate('room')
     .sort({ createdAt: -1 });
   ```
2. **Atomic Updates**:
   Use `findOneAndUpdate` with `{ new: true, runValidators: true }`.
3. **Pagination**:
   Use `limit` and `skip` for large data sets, returning total count metadata.
