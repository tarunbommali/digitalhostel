# Inside Home

A state-of-the-art, multi-tenant Hostel Management Web Application designed for **JNTUGV University**. Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **Express.js**, and **MongoDB / Mongoose**.

---

## 🌟 Key Features

### 🔐 1. Multi-Role RBAC (Role-Based Access Control)
- **OIH (Officer Incharge of Hostel / Main Admin)**: Full system administration, Security Guard and Moderator creation, Hostel Block & Room setup, Bill Batch Modification, and Bill Verification & Release.
- **Administration Moderator**: Student registration, student profile management, bulk CSV student import, and monthly mess bill drafting/posting.
- **Discipline Warden**: Student disciplinary flagging, report management, and leave approval.
- **🛡️ Security Guard**: Digital ID QR Pass Scanning, leave pass verification, gate entry/exit movement recording, and access to the gate outing logbook.
- **Mess Attendance Staff**: Exclusively restricted to Mess Attendance Marking via live camera QR scanner and USB barcode guns.
- **Student**: Access to personal Digital Pass, Outing Pass status & gate movement history, monthly fee dues, SBI Collect payment records, and leave applications.

---

### 🪪 2. Digital Pass, Security Guard Scanner & Outing Logbook Engine
- **Digital QR Pass**: Generates unique Digital ID Passes containing student registration numbers and encrypted payloads.
- **Security Guard Scanner Portal**: Dedicated gate pass scanner allowing Security Guards to scan student Digital ID QR codes (or enter registration/hostel numbers), verify active leave passes, and log student **OUT (Gate Exit)** or **IN (Gate Entry)** movements into the logbook.
- **Outing Logbook**: Filterable gate movement history featuring default **Today-only** display, time period range filters, student gender filters (Boys/Girls Hostel), department filters, and instant text search.
- **Instant Web Audio Feedback**: Zero-latency Web Audio API synthesizers producing pleasant chimes for success and warning buzzes for duplicate/inactive scans.
- **Laptop & Multi-Camera Cascade**: 4-tier camera fallback cascade with live camera device selector dropdown.
- **USB 2D Barcode Gun Listener**: Global keyboard listener automatically detecting physical USB QR scanner guns for rapid attendance marking.
- **Time Slots**: Enforces Breakfast (07:00–10:00 AM), Lunch (12:00–03:00 PM), and Dinner (07:00–10:00 PM) windows.

---

### 💳 3. Monthly Billing & SBI Collect Payment Workflow
- **Targeted Bill Generation**: Draft monthly bills for All Hostels, Boys Hostel Only, or Girls Hostel Only.
- **OIH Verification Workflow**: Bills drafted by staff remain in `Pending Admin Verification` until approved by the **OIH**. Main Admin can **Modify** amounts/descriptions before clicking **Verify & Release**.
- **SBI Collect Payment Method**: Enforces `sbi_collect` payment method with mandatory SBI Collect Reference Payment IDs.
- **Locked Student Selection**: Selected students in payment/allocation forms are locked into non-editable badges with explicit "Change" controls.

---

### 🎓 4. Automatic Batch Graduation & Bed Release
- **Academic Year Completion**: Marking an academic year batch as completed automatically graduates all enrolled students and releases their assigned hostel beds.

---

### 🧱 5. Single Responsibility Principle (SRP) Modular Architecture
- Every page component strictly adheres to clean TypeScript/JSX.
- Modular folder structure separating UI components, custom hooks, services, utilities, and TypeScript types under `client/src/modules/` and `client/src/core/`.

---

## 📁 Repository Structure

```text
DigitalHostel/
├── package.json                 # Root script runner (concurrently run server & client)
├── client/                      # Frontend Application (React + Vite + TypeScript)
│   ├── src/
│   │   ├── core/                # Core Design System, Hooks & Lookups
│   │   │   ├── components/      # PhoneInput, LookupManager, UI primitives
│   │   │   ├── hooks/           # useHostelLookups, etc.
│   │   │   ├── lookup/          # Master Lookups Module
│   │   │   └── utils/           # Formatters & Helpers
│   │   └── modules/             # Feature Modules
│   │       ├── attendance/      # Attendance Scanner, Service, Hooks & Components
│   │       ├── auth/            # Auth, Login & Password Reset
│   │       ├── bills/           # Monthly Bills & Admin Verification
│   │       ├── dashboard/       # OIH, Staff, Guard & Student Dashboards
│   │       ├── flags/           # Student Flagging & Disciplinary Reports
│   │       ├── guard/           # Security Guard Scanner & Gate Entry Pass
│   │       ├── leaves/          # Student Leave Applications
│   │       ├── moderators/      # Staff, Warden & Guard Account Management
│   │       ├── outings/         # Outing Logbook & Period/Gender/Dept Filtering
│   │       ├── payments/        # SBI Collect Payments
│   │       ├── rooms/           # Rooms, Blocks & Bed Allocations
│   │       ├── settings/        # System Settings & Master Lookups
│   │       └── students/        # Student Directory & Registration
│   └── package.json
│
└── server/                      # Backend REST API (Node.js + Express + Mongoose)
    ├── middleware/              # Auth & RBAC Middleware
    ├── models/                  # Mongoose Schemas (User, Student, OutingLog, MonthlyBill, etc.)
    ├── routes/                  # API Controllers (auth, students, outings, bills, attendance, etc.)
    ├── services/                # Business Logic Services
    ├── server.js                # Express App Entrypoint
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** instance running locally or on MongoDB Atlas

### ⚡ Quick Start (Run Both Client & Server Concurrently)

Install all dependencies (root, client, and server) with a single command:
```bash
npm run install:all
```

Create a `.env` file inside `server/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hostel_db
JWT_SECRET=your_secure_jwt_secret_key
```

Start **both backend and frontend** together concurrently from the root:
```bash
npm run dev
```

---

### 🛠️ Individual Execution Options

- **Run Backend Only**: `npm run server`
- **Run Frontend Only**: `npm run client`

The frontend application will be accessible at `http://localhost:5173` and backend services at `http://localhost:5000`.

---

## 🔑 Default Credentials & Roles

| Role / Account | Default Email | Default Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **OIH (Main Admin)** | `admin@hostel.edu` | `Admin#123` | Full System Control, Staff/Guard Creation, Bill Verification & Release |
| **Administration** | `staff@hostel.edu` | `Password#123` | Student Directory, Registration, CSV Import, Bill Drafting |
| **Discipline Warden** | `warden@hostel.edu` | `Password#123` | Student Flagging & Discipline Reports |
| **Security Guard** | `guard@hostel.edu` | `Password#123` | Digital ID QR Scanning, Leave Verification, Gate Outing Logbook (`/dashboard`, `/outings`) |
| **Mess Attendance Staff** | `mess@hostel.edu` | `Password#123` | Mess Attendance Marking Only (`/attendance`) |

---

## 🧪 Verification & Build Check

To build the client bundle for production:
```bash
cd client
npm run build
```

---

## 📄 License
Designed & Developed for **JNTUGV University Hostel Management**.
