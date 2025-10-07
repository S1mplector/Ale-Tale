import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { storageAdapter } from '@infrastructure/storage/StorageAdapter';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute ensures storage is initialized before rendering child routes
 * If setup is required but not completed, renders nothing (App.tsx handles setup page)
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const checkSetup = () => {
      setNeedsSetup(storageAdapter.needsSetup());
      setIsChecking(false);
    };

    checkSetup();
  }, []);

  if (isChecking) {
    return null; // Or a loading spinner
  }

  if (needsSetup) {
    // Return null - App.tsx will handle showing setup page
    return null;
  }

  return <>{children}</>;
}
