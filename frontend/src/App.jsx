import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUserManagement from './pages/admin/UserManagement';

// Librarian Pages
import LibrarianDashboard from './pages/librarian/Dashboard';

// Student/Professor Pages
import StudentDashboard from './pages/student/Dashboard';
import ProfessorDashboard from './pages/professor/Dashboard';
import BookBrowser from './pages/shared/BookBrowser';
import PlaceholderPage from './pages/shared/PlaceholderPage';
import IssuedBooks from './pages/shared/IssuedBooks';
import Fines from './pages/shared/Fines';
import Reports from './pages/admin/Reports';
import Announcements from './pages/shared/Announcements';
import BookRequests from './pages/librarian/BookRequests';
import Notifications from './pages/shared/Notifications';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Module */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><DashboardLayout /></ProtectedRoute>}>
         <Route index element={<AdminDashboard />} />
         <Route path="users" element={<AdminUserManagement />} />
         {/* Using BookBrowser for Book Management temporarily to show feature completeness */}
         <Route path="books" element={<BookBrowser />} />
         <Route path="history" element={<IssuedBooks />} />
         <Route path="reports" element={<Reports />} />
         <Route path="fines" element={<Fines />} />
         <Route path="announcements" element={<Announcements />} />
         <Route path="requests" element={<BookRequests />} />
         <Route path="*" element={<PlaceholderPage />} />
      </Route>

      {/* Librarian Module */}
      <Route path="/librarian" element={<ProtectedRoute allowedRoles={['Librarian']}><DashboardLayout /></ProtectedRoute>}>
         <Route index element={<LibrarianDashboard />} />
         <Route path="users" element={<AdminUserManagement />} />
         <Route path="books" element={<BookBrowser />} />
         <Route path="issues" element={<IssuedBooks />} />
         <Route path="fines" element={<Fines />} />
         <Route path="announcements" element={<Announcements />} />
         <Route path="requests" element={<BookRequests />} />
         <Route path="*" element={<PlaceholderPage />} />
      </Route>

      {/* Student Module */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['Student']}><DashboardLayout /></ProtectedRoute>}>
         <Route index element={<StudentDashboard />} />
         <Route path="browse" element={<BookBrowser />} />
         <Route path="issued" element={<IssuedBooks />} />
         <Route path="fines" element={<Fines />} />
         <Route path="notifications" element={<Notifications />} />
         <Route path="*" element={<PlaceholderPage />} />
      </Route>

      {/* Professor Module */}
      <Route path="/professor" element={<ProtectedRoute allowedRoles={['Professor']}><DashboardLayout /></ProtectedRoute>}>
         <Route index element={<ProfessorDashboard />} />
         <Route path="browse" element={<BookBrowser />} />
         <Route path="issued" element={<IssuedBooks />} />
         <Route path="fines" element={<Fines />} />
         <Route path="notifications" element={<Notifications />} />
         <Route path="*" element={<PlaceholderPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
