import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => role.toLowerCase() === user.role.toLowerCase())) {
    // Redirect based on their role if they try to access unauthorized pages
    const pathMap = {
      admin: '/admin',
      librarian: '/librarian',
      student: '/student',
      professor: '/professor',
    };
    return <Navigate to={pathMap[user.role.toLowerCase()] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
