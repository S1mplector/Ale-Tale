import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '@presentation/pages/HomePage';
import { AddEntryPage } from '@presentation/pages/AddEntryPage';
import { EntryDetailPage } from '@presentation/pages/EntryDetailPage';
import { Layout } from '@presentation/components/Layout';
import { EditEntryPage } from '@presentation/pages/EditEntryPage';
import { BarsPage } from '@presentation/pages/BarsPage';
import { LogPage } from '@presentation/pages/LogPage';
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
          <Route path="/log" element={<LogPage />} />
          <Route path="/add" element={<AddEntryPage />} />
          <Route path="/entry/:id" element={<EntryDetailPage />} />
          <Route path="/entry/:id/edit" element={<EditEntryPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
