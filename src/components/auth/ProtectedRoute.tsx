import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showingLoader, setShowingLoader] = useState(false);
  
  // Show loader after a short delay to prevent flashing
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (loading) {
      timeoutId = window.setTimeout(() => {
        setShowingLoader(true);
      }, 300);
    } else {
      setShowingLoader(false);
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [loading]);
  
  // Show loading state only if loading takes more than 300ms
  if (loading && showingLoader) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  // If not loading but no user, redirect to sign-in
  if (!loading && !user) {
    console.log("🔒 ProtectedRoute: Access denied, redirecting to sign-in");
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  
  // User is authenticated or we're still checking, render children
  return <>{children}</>;
};
