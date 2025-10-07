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
import { SplashScreen } from '@presentation/components/SplashScreen';
import { SetupPage } from '@presentation/pages/SetupPage';
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
          <Route path="/" element={<HomePage />} />
          <Route path="/bars" element={<BarsPage />} />
          <Route path="/bars/add" element={<AddBarPage />} />
          <Route path="/bars/:id" element={<BarDetailPage />} />
          <Route path="/bars/:id/edit" element={<EditBarPage />} />
          <Route path="/log" element={<LogPage />} />
          <Route path="/add" element={<AddEntryPage />} />
          <Route path="/entry/:id" element={<EntryDetailPage />} />
          <Route path="/entry/:id/edit" element={<EditEntryPage />} />
          <Route path="/my-beers" element={<MyBeersPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
