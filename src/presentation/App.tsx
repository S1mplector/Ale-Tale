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

export function App() {
  const [showSplash, setShowSplash] = React.useState(true);

  const handleSplashDone = React.useCallback(() => {
    setShowSplash(false);
  }, []);

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
