# 🪐 LibOrbit — Library Management System

**LibOrbit** is a full-stack library management portal built for educational institutions. It provides secure role-based access for Admins, Librarians, Students, and Professors, an automated fine/wallet system, a book request-and-approval workflow, and a modern animated UI.

**Live app:** [liborbit.vercel.app](https://liborbit.vercel.app)
**Live API:** `https://library-management-lwz9.onrender.com/api`

---

## ✨ Features

- 🛡️ **Role-based access control** — separate dashboards and permissions for **Admin**, **Librarian**, **Student**, and **Professor** roles, enforced by JWT + middleware on every protected route.
- 📚 **Digital book catalog** — add, edit, and remove books; browse and search the catalog from any role.
- 🔄 **Book request workflow** — users submit **standard** (catalog) or **custom** (purchase) requests; librarians/admins approve or reject them, with full request history per user.
- 📖 **Issue & return tracking** — librarians issue and return books, with a full issue log and the ability to delete erroneous records.
- 💳 **Virtual wallet & auto-fines** — every user has a wallet; overdue fines are calculated and can be paid off, with admins/librarians able to mark fines as settled.
- 🔐 **Full authentication flow** — registration, login, and a forgot-password flow with email-based OTP verification (via Nodemailer) and password reset.
- 📢 **Campus announcements** — Admins and Librarians can broadcast announcements to all users, with support for single or bulk deletion.
- 📊 **Dashboards & reports** — stats and chart data (Chart.js) per role, plus exportable PDF reports (jsPDF) for admins.
- 🔔 **Notifications** — in-app notifications for users.
- ✨ **Modern UI** — React + Tailwind CSS with Framer Motion animations and Lucide icons.

---

## 🛠️ Tech Stack

**Frontend**
- React 19 (Vite)
- React Router DOM
- Tailwind CSS
- Framer Motion (animations)
- Chart.js / react-chartjs-2 (dashboards)
- jsPDF + jspdf-autotable (PDF report export)
- Axios
- Lucide React (icons)

**Backend**
- Node.js + Express 5
- MySQL (via `mysql2`)
- JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` for auth
- Nodemailer (OTP emails for password reset)
- CORS-configured for a separate deployed frontend

**Testing**
- Python (`pytest` + `requests`) integration tests against the live API (`python_tests/`)

---

## 📁 Project Structure

```
Library-management/
├── backend/
│   ├── config/
│   │   ├── db.js              # MySQL connection pool
│   │   └── initDb.js          # Auto-creates tables & seeds a default admin on startup
│   ├── controllers/
│   │   ├── authController.js       # Register, login, forgot/reset password, OTP
│   │   ├── bookController.js       # Catalog CRUD
│   │   ├── issueController.js      # Issue / return / delete issue records
│   │   ├── requestController.js    # Standard & custom book requests
│   │   ├── userController.js       # User CRUD, wallet balance & top-up
│   │   ├── fineController.js       # Fine listing & payment
│   │   ├── announcementController.js
│   │   └── dashboardController.js  # Stats & chart data
│   ├── middleware/
│   │   └── auth.js            # `protect` (JWT check) and `authorize` (role check)
│   ├── routes/                # One router per resource, mounted under /api
│   └── server.js              # App entrypoint
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── public/        # Landing, Login, Forgot Password
│       │   ├── admin/         # Dashboard, User Management, Reports
│       │   ├── librarian/     # Dashboard, Book Requests
│       │   ├── student/       # Dashboard
│       │   ├── professor/     # Dashboard
│       │   └── shared/        # Book Browser, Issued Books, Fines,
│       │                      # Announcements, Notifications, Request History
│       ├── components/
│       ├── layouts/
│       ├── context/           # Auth/global state
│       └── services/          # API client (Axios)
├── python_tests/
│   ├── library_system.py      # Small standalone library model used in unit tests
│   └── test_library.py        # Pytest integration tests against the live API
└── package.json                # Shared/root frontend dependency list
```

---

## 🔌 API Overview

All endpoints are mounted under `/api` on the backend. Protected routes require a `Bearer` JWT; role-restricted routes additionally require `Admin` and/or `Librarian`.

| Resource | Base route | Notes |
|---|---|---|
| Auth | `/api/auth` | `login`, `register`, `forgot-password`, `verify-otp`, `reset-password` |
| Users | `/api/users` | CRUD (Admin/Librarian), wallet balance & top-up (any authenticated user) |
| Books | `/api/books` | Catalog CRUD (write access: Admin/Librarian) |
| Issues | `/api/issues` | Issue/return/delete book loans (write access: Admin/Librarian) |
| Requests | `/api/requests` | Standard & custom book requests, personal history (`my-history`), approve/reject |
| Fines | `/api/fines` | View fines (all users), mark as paid (Admin/Librarian) |
| Announcements | `/api/announcements` | View (all users), create/delete (Admin/Librarian) |
| Dashboard | `/api/dashboard` | `stats` and `chart` data |

On first run, the backend automatically creates any missing tables (`announcements`, `book_requests`, `custom_book_requests`, plus schema patches to `users`) and seeds a default admin account:

```
email: admin@autolib.ai
password: admin123
```

> ⚠️ Change this password immediately in any real deployment.

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MySQL](https://www.mysql.com/) running locally or remotely (e.g. via XAMPP, MySQL Workbench, or a hosted instance)
- (Optional) [Python 3](https://www.python.org/) + `pytest` + `requests` to run the integration tests

### 2. Clone the repo

```bash
git clone https://github.com/divypatel31/Library-management.git
cd Library-management
```

### 3. Database setup

Create the database — the backend will create most required tables automatically on first boot:

```sql
CREATE DATABASE library_db;
```

> The app expects a base `users` table (with columns such as `user_id`, `full_name`, `email`, `password`, `role`) and a `books` table (with `book_id`) to already exist, since `initDb.js` only adds columns/tables incrementally on top of them. If you're starting from scratch, import an existing schema/dump if you have one, or create these base tables first.

### 4. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=library_db
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Start the backend:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start        # plain node
```

### 5. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be running at `http://localhost:5173`.

> The frontend's API base URL is configured in `frontend/src/services`. When switching between local and deployed backends, update it there.

### 6. Run the Python integration tests (optional)

```bash
cd python_tests
pip install pytest requests
pytest
```

> `test_library.py` targets the deployed API URL by default — update `BASE_URL` in that file to point at your local backend (e.g. `http://localhost:5000/api`) if you want to test locally.

---

## 🔐 Roles at a Glance

| Role | Can do |
|---|---|
| **Admin** | Everything — manage users, books, issues, requests, fines, announcements, and view system-wide reports |
| **Librarian** | Manage books, issues, requests, fines, and announcements |
| **Student / Professor** | Browse the catalog, submit book requests, view their issued books, fines, wallet, announcements, and notifications |

---

## 📄 License

This project does not currently have an open-source license. Licensing details will be added at a later date.
