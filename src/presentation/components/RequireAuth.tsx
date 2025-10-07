import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabaseService } from '@infrastructure/database/SupabaseService';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if Supabase is configured
    if (!supabaseService.isConfigured()) {
      // If cloud sync not configured, allow access (local-only mode)
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    // Check authentication status
    const checkAuth = () => {
      const user = supabaseService.getCurrentUser();
      setIsAuthenticated(!!user);
      setIsChecking(false);
    };

    checkAuth();
  }, []);

  if (isChecking) {
    // Show loading spinner while checking auth
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '3rem' }}>🍺</div>
        <div style={{ color: '#7f8c8d' }}>Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to sign-in page, save the attempted location
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
