import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@presentation/pages/HomePage';
import { AddEntryPage } from '@presentation/pages/AddEntryPage';
import { EntryDetailPage } from '@presentation/pages/EntryDetailPage';
import { Layout } from '@presentation/components/Layout';
import { EditEntryPage } from '@presentation/pages/EditEntryPage';
import { BarsPage } from '@presentation/pages/BarsPage';
import { AddBarPage } from '@presentation/pages/AddBarPage';
import { BarDetailPage } from '@presentation/pages/BarDetailPage';
import { EditBarPage } from '@presentation/pages/EditBarPage';
import { LogPage } from '@presentation/pages/LogPage';
import { MyBeersPage } from '@presentation/pages/MyBeersPage';
import { StatisticsPage } from '@presentation/pages/StatisticsPage';
import { SearchPage } from '@presentation/pages/SearchPage';
import { SettingsPage } from '@presentation/pages/SettingsPage';
import { SignUpPage } from '@presentation/pages/SignUpPage';
import { SignInPage } from '@presentation/pages/SignInPage';
import { SplashScreen } from '@presentation/components/SplashScreen';
import { SetupPage } from '@presentation/pages/SetupPage';
import { RequireAuth } from '@presentation/components/RequireAuth';
import { storageAdapter } from '@infrastructure/storage/StorageAdapter';
import { supabaseService } from '@infrastructure/database/SupabaseService';
import { syncService } from '@infrastructure/database/SyncService';

export function App() {
  const [showSplash, setShowSplash] = React.useState(true);
  const [isReady, setIsReady] = React.useState(false);

  // Initialize storage adapter and cloud services
  React.useEffect(() => {
    const init = async () => {
      try {
        // Initialize local storage
        await storageAdapter.initialize();

        // Initialize Supabase if configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const disableSync = import.meta.env.VITE_DISABLE_CLOUD_SYNC === 'true';

        if (supabaseUrl && supabaseKey && !disableSync) {
          try {
            supabaseService.initialize({ url: supabaseUrl, anonKey: supabaseKey });
            await syncService.initialize();
            
            // Start auto-sync if user is authenticated
            if (supabaseService.isAuthenticated()) {
              syncService.startAutoSync();
              console.log('✅ Cloud sync enabled');
            }
          } catch (error) {
            console.log('⚠️ Cloud sync not available:', error);
          }
        } else {
          console.log('ℹ️ Cloud sync not configured (local-only mode)');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, []);

  const handleSplashDone = React.useCallback(() => {
    setShowSplash(false);
  }, []);

  // Show nothing while initializing
  if (!isReady) {
    return null;
  }

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          
          {/* Protected routes - require authentication */}
          <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
          <Route path="/bars" element={<RequireAuth><BarsPage /></RequireAuth>} />
          <Route path="/bars/add" element={<RequireAuth><AddBarPage /></RequireAuth>} />
          <Route path="/bars/:id" element={<RequireAuth><BarDetailPage /></RequireAuth>} />
          <Route path="/bars/:id/edit" element={<RequireAuth><EditBarPage /></RequireAuth>} />
          <Route path="/log" element={<RequireAuth><LogPage /></RequireAuth>} />
          <Route path="/add" element={<RequireAuth><AddEntryPage /></RequireAuth>} />
          <Route path="/entry/:id" element={<RequireAuth><EntryDetailPage /></RequireAuth>} />
          <Route path="/entry/:id/edit" element={<RequireAuth><EditEntryPage /></RequireAuth>} />
          <Route path="/my-beers" element={<RequireAuth><MyBeersPage /></RequireAuth>} />
          <Route path="/statistics" element={<RequireAuth><StatisticsPage /></RequireAuth>} />
          <Route path="/search" element={<RequireAuth><SearchPage /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
