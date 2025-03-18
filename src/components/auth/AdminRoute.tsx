import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-book-accent mr-2" />
        <span className="text-book-dark">Loading user data...</span>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!user) {
    console.log("User not authenticated, redirecting to signin");
    return <Navigate to="/signin" replace />;
  }

  // Redirect to dashboard if authenticated but not an admin
  if (!isAdmin) {
    console.log("User is not an admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("Admin authenticated, rendering protected admin content");
  return <>{children}</>;
};

export default AdminRoute; 