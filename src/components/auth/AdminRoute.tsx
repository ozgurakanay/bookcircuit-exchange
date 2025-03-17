import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

// For now, AdminRoute is just a wrapper over ProtectedRoute
// In the future, this can be enhanced to check for admin roles
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // Simply use the existing ProtectedRoute for now
  // When user roles are implemented, we can add additional checks
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute; 