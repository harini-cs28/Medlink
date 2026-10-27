import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F8F4] text-[#172321]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#087F73]"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to default dashboard based on their role
    if (user.role === 'HOSPITAL_ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'PHARMACY_MANAGER') return <Navigate to="/manager" replace />;
    return <Navigate to="/pharmacist" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
