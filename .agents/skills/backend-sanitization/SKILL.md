---
name: backend-sanitization
description: >-
  Payload validation, parameter sanitization, and preventing NoSQL injection and prototype pollution.
---

# Backend Data Sanitization & Validation

## Guidelines
1. **Field Whitelisting**: Never pass `req.body` directly to `Model.create()` or `Model.findByIdAndUpdate()`. Extract only permitted fields.
2. **Type Casting & Trimming**: Trim string fields (e.g. `rollNumber.trim()`, `email.toLowerCase().trim()`).
3. **NoSQL Injection Prevention**: Validate that query values are primitive types (strings, numbers) rather than raw objects where malicious MongoDB operators (`$gt`, `$ne`, `$where`) could be injected.
