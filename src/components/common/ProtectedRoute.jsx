import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import { PageLoader } from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  redirectTo = ROUTES.LOGIN 
}) => {
  const { isAuthenticated, isLoading, user, role } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <PageLoader text="Checking authentication..." />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If specific roles are required and user doesn't have the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on user role
    let dashboardRoute = ROUTES.HOME;
    
    if (isAuthenticated) {
      switch (role) {
        case 'PATIENT':
          dashboardRoute = ROUTES.USER_DASHBOARD;
          break;
        case 'DOCTOR':
          dashboardRoute = ROUTES.DOCTOR_DASHBOARD;
          break;
        case 'ADMIN':
          dashboardRoute = ROUTES.ADMIN_DASHBOARD;
          break;
        default:
          dashboardRoute = ROUTES.HOME;
      }
    }
    
    return <Navigate to={dashboardRoute} replace />;
  }

  // If all checks pass, render the protected component
  return children;
};

// Higher-order component for role-based protection
export const withRoleProtection = (Component, allowedRoles) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific role protection components
export const PatientRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['PATIENT']}>
    {children}
  </ProtectedRoute>
);

export const DoctorRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['DOCTOR']}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['ADMIN']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;