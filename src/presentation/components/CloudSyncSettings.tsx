import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabaseService } from '@infrastructure/database/SupabaseService';
import { syncService, SyncStatus } from '@infrastructure/database/SyncService';

export function CloudSyncSettings() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check auth status
    const user = supabaseService.getCurrentUser();
    setIsAuthenticated(!!user);
    setUserEmail(user?.email || null);

    // Load sync status
    setSyncStatus(syncService.getStatus());

    // Poll sync status every second
    const interval = setInterval(() => {
      setSyncStatus(syncService.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  const handleSignOut = async () => {
    try {
      await supabaseService.signOut();
      setIsAuthenticated(false);
      setUserEmail(null);
      syncService.stopAutoSync();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncService.sync();
      if (result.success) {
        setSyncStatus(syncService.getStatus());
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // If Supabase not configured, don't show anything
  if (!supabaseService.isConfigured()) {
    return null;
  }

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#e8f4f8', borderRadius: 6, border: '1px solid #3498db' }}>
      <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1rem' }}>☁️ Cloud Sync</h4>
      <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d', fontSize: '0.875rem' }}>
        Sync your data across all your devices
      </p>

      {!isAuthenticated ? (
        <>
          <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d', fontSize: '0.875rem' }}>
            Sign in to enable multi-device sync and cloud backups.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to="/signin"
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#3498db',
                color: 'white',
                textDecoration: 'none',
                borderRadius: 4,
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'inline-block',
              }}
            >
              🔐 Sign In
            </Link>
            <Link
              to="/signup"
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#27ae60',
                color: 'white',
                textDecoration: 'none',
                borderRadius: 4,
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'inline-block',
              }}
            >
              ✨ Sign Up
            </Link>
          </div>
        </>
      ) : (
        <>
          <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 4, marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
              Signed in as
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#2c3e50' }}>
              {userEmail}
            </div>
          </div>

          {syncStatus && (
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 4, marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#2c3e50' }}>
                  {syncStatus.inProgress ? '🔄 Syncing...' : '✅ Synced'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                  {formatLastSync(syncStatus.lastSync)}
                </span>
              </div>
              {syncStatus.error && (
                <div style={{ fontSize: '0.75rem', color: '#e74c3c', marginTop: '0.5rem' }}>
                  ⚠️ {syncStatus.error}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleSync}
              disabled={isSyncing || syncStatus?.inProgress}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: (isSyncing || syncStatus?.inProgress) ? '#95a5a6' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: (isSyncing || syncStatus?.inProgress) ? 'not-allowed' : 'pointer',
              }}
            >
              {(isSyncing || syncStatus?.inProgress) ? '⏳ Syncing...' : '🔄 Sync Now'}
            </button>
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              🚪 Sign Out
            </button>
          </div>
          <p style={{ margin: '0.75rem 0 0 0', color: '#7f8c8d', fontSize: '0.75rem' }}>
            💡 Your data syncs automatically every 5 minutes. Click "Sync Now" to force an immediate sync.
          </p>
        </>
      )}
    </div>
  );
}
