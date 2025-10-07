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

export function App() {
  const [showSplash, setShowSplash] = React.useState(true);
  const [isReady, setIsReady] = React.useState(false);

  // Initialize storage adapter
  React.useEffect(() => {
    const init = async () => {
      try {
        await storageAdapter.initialize();
        // Note: We no longer require setup - IndexedDB works out of the box
        // File system is optional and can be enabled from Settings
      } catch (error) {
        console.error('Error initializing storage:', error);
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
