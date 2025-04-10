import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

/**
 * A wrapper around routes that require authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {string} props.allowedRoles - Array of roles allowed to access this route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // If still loading authentication state, show loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If role restriction is specified and user's role doesn't match, redirect to dashboard
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // For volunteers trying to access NGO routes, redirect to volunteer dashboard
      if (user.role === ROLES.VOLUNTEER) {
        return <Navigate to="/dashboard" replace />;
      }

      // For NGOs trying to access volunteer routes, redirect to NGO dashboard
      if (user.role === ROLES.NGO) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  // If all checks pass, render the children
  return children;
};

export default ProtectedRoute; 