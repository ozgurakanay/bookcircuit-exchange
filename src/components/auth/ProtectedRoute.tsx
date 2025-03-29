import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, profile } = useAuth();
  const [loadingTime, setLoadingTime] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  
  console.log('DEBUG ProtectedRoute - auth state:', { user, loading, profile, loadingTime });

  // Add a timer to track how long we've been loading
  useEffect(() => {
    let timer: number | undefined;
    
    if (loading) {
      // Reset the counter
      setLoadingTime(0);
      setShowRetry(false);
      
      // Start a counter
      timer = window.setInterval(() => {
        setLoadingTime(prev => {
          const newTime = prev + 1;
          // After 5 seconds of loading, show retry button (reduced from 10s)
          if (newTime >= 5) {
            setShowRetry(true);
          }
          return newTime;
        });
      }, 1000);
    } else {
      // Clear the timer if we're not loading
      setLoadingTime(0);
      setShowRetry(false);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [loading]);
  
  // Handler for manual page refresh
  const handleRetry = () => {
    console.log('DEBUG: Manual refresh requested');
    window.location.reload();
  };

  // If we have a user but are still loading (probably just waiting for profile)
  // go ahead and render the children after 1.5 seconds
  if (user && loading && loadingTime > 1.5) {
    console.log('DEBUG: User authenticated but still loading profile. Rendering content anyway.');
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex items-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-book-accent mr-2" />
          <span className="text-book-dark">Loading user data... ({loadingTime}s)</span>
        </div>
        
        {showRetry && (
          <div className="mt-4 text-center">
            <p className="text-sm text-red-500 mb-2">Loading is taking longer than expected.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    console.log("User not authenticated, redirecting to signin");
    return <Navigate to="/signin" replace />;
  }

  console.log("User authenticated, rendering protected content");
  return <>{children}</>;
};

export default ProtectedRoute;
