# 🛡️ Disaster Recovery & Backup Runbook

## Overview
This document outlines the Backup, Restore, and Disaster Recovery Standard Operating Procedure (SOP) for the Digital Hostel multi-tenant platform.

---

## 🎯 Recovery Objectives

| Metric | SLA Target | Actual Drill Result |
| :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | $\le 1\text{ Hour}$ | Continuous snapshot / hourly backup |
| **Recovery Time Objective (RTO)** | $\le 15\text{ Minutes}$ ($900\text{s}$) | **$26.75\text{s}$** (Cold-restore simulation) |

---

## 📦 Backup Procedures

### 1. Automated Snapshot Export
```bash
# Export all 17 collections to compressed archive
mongodump --uri="$MONGODB_URI" --gzip --archive=backup_$(date +%Y%m%d_%H%M%S).gz
```

### 2. Retention Policy
- Hourly snapshots retained for **7 days**.
- Daily snapshots retained for **30 days**.
- Monthly audit backups retained for **365 days**.

---

## 🔄 Restoration Procedures

### 1. Cold Restore to Target Database
```bash
# Restore from archive into target cluster with collection drop
mongorestore --uri="$TARGET_MONGODB_URI" --gzip --archive=backup_file.gz --drop
```

### 2. Rebuild Compound Indexes
```bash
cd server
node -e "require('./src/utils/rebuildIndexes.js')"
```

### 3. Verify Restoration Drill
Execute the automated DR restore drill to verify document parity, index rebuilds, and tenant isolation:
```bash
cd server
node tests/drRestoreDrill.js
```

---

## 📋 Collection Inventory (17 Total)

The restore procedure synchronizes and rebuilds indexes across all 17 platform collections:
1. `organizations`
2. `users`
3. `students`
4. `rooms`
5. `bedallocations`
6. `monthlybills`
7. `payments`
8. `paymentallocations`
9. `attendancesessions`
10. `attendancerecords`
11. `leaverequests`
12. `outinglogs`
13. `flagreports`
14. `auditlogs`
15. `blocks`
16. `departments`
17. `academicyears`
