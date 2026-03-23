# 🪐 LibOrbit - Enterprise Library Management System

**LibOrbit** is a modern, full-stack library management portal designed for educational institutions. It features secure role-based access, automated fine calculations via a virtual wallet, dynamic book request workflows, and a premium, highly animated user interface.

## ✨ Key Features

* 🛡️ **Role-Based Access Control (RBAC):** Distinct, secure portals tailored for **Admins, Librarians, Students, and Professors**.
* 📚 **Smart Digital Catalog:** Real-time inventory tracking with dynamic book cover fetching via the OpenLibrary API.
* 💳 **Virtual Wallet & Auto-Fines:** Students have a digital wallet that automatically deducts calculated penalties for overdue books upon return.
* 🔄 **Request & Issue Workflow:** Users can submit Standard (catalog) or Custom (purchase) book requests. Librarians can approve, reject, and manage the issue lifecycle.
* 🔐 **Advanced Authentication:** Secure login with JWT (JSON Web Tokens), hashed passwords, and a Nodemailer-powered OTP forgot-password flow.
* 📢 **Campus Announcements:** Admins and Librarians can broadcast global notifications to all users.
* ✨ **Premium UI/UX:** A highly responsive, glassmorphism-inspired interface powered by Tailwind CSS and Framer Motion animations.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Styling)
* Framer Motion (Animations)
* Lucide React (Icons)
* Axios & React Router Dom

**Backend:**
* Node.js & Express.js
* MySQL (Relational Database via `mysql2`)
* JWT & Bcrypt.js (Security & Auth)
* Nodemailer (Email Services)

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### 1. Prerequisites
* [Node.js](https://nodejs.org/) installed
* [MySQL](https://www.mysql.com/) installed and running (via XAMPP, MySQL Workbench, etc.)

### 2. Database Setup
1. Open your MySQL client.
2. Create a new database:
   ```sql
   CREATE DATABASE library_db;
Import your database dump file (e.g., final_database.sql) to instantly generate the tables.

3. Backend Setup
Navigate to the backend directory and install dependencies:

Bash
cd backend
npm install
Create a .env file in the /backend folder and add your environment variables:

Code snippet
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=library_db
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
Start the backend server:

Bash
npm run dev
4. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:

Bash
cd frontend
npm install
Start the React development server:

Bash
npm run dev
The application will now be running at http://localhost:5173.


