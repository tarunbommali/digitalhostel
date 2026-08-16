---
name: backend-api-workflow
description: >-
  Step-by-step workflow for designing, implementing, securing, and testing REST API endpoints in the Express server.
---

# Backend API Workflow

## Step-by-Step Endpoint Creation
1. **Identify Resource & Scope**:
   - Determine target resource (e.g. `students`, `rooms`, `bills`, `attendance`, `leaves`).
   - Identify required authentication and role level (`SuperAdmin`, `Admin`, `Moderator`, `Student`).
2. **Define or Update Mongoose Model**:
   - Check `server/models/<Model>.js`. Add schema validation rules, default values, and compound indexes if required.
3. **Implement Route Handler in `server/routes/<resource>.js`**:
   - Validate incoming query parameters or payload body.
   - Enforce multi-tenancy filter `{ organization: req.user.organization }`.
   - Wrap in `try...catch` and return standardized responses:
     ```javascript
     router.post('/path', authMiddleware, async (req, res) => {
       try {
         const { organization } = req.user;
         // logic...
         res.status(201).json({ success: true, data: result });
       } catch (err) {
         res.status(400).json({ success: false, message: err.message });
       }
     });
     ```
4. **Register Router in `server/index.js`** (if new router file created):
   - `app.use('/api/<resource>', resourceRouter);`
5. **Verify Endpoint**:
   - Test response status codes, validation error cases, and role access restrictions.
