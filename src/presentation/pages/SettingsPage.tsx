import React, { useEffect, useState } from 'react';
import { listJournalEntriesUseCase, listBarsUseCase } from '@di/container';

export function SettingsPage() {
  const [stats, setStats] = useState({ entries: 0, bars: 0 });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [entries, bars] = await Promise.all([
      listJournalEntriesUseCase.execute(),
      listBarsUseCase.execute(),
    ]);
    setStats({ entries: entries.length, bars: bars.length });
  };

  const handleExportData = () => {
    try {
      // Get all data from localStorage
      const journalEntries = localStorage.getItem('journal-entries') || '[]';
      const bars = localStorage.getItem('bars') || '[]';
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          journalEntries: JSON.parse(journalEntries),
          bars: JSON.parse(bars),
        },
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ale-tale-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      try {
        const file = e.target.files[0];
        if (!file) return;

        const text = await file.text();
        const importData = JSON.parse(text);

        if (!importData.version || !importData.data) {
          throw new Error('Invalid backup file format');
        }

        // Restore data to localStorage
        if (importData.data.journalEntries) {
          localStorage.setItem('journal-entries', JSON.stringify(importData.data.journalEntries));
        }
        if (importData.data.bars) {
          localStorage.setItem('bars', JSON.stringify(importData.data.bars));
        }

        setShowImportSuccess(true);
        setTimeout(() => {
          setShowImportSuccess(false);
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import data. Please check the file format and try again.');
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (showConfirm) {
      localStorage.removeItem('journal-entries');
      localStorage.removeItem('bars');
      setShowConfirm(false);
      window.location.reload();
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 5000);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Settings</h2>
      
      {showExportSuccess && (
        <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '1rem', borderRadius: 6, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✓ Data exported successfully!
        </div>
      )}

      {showImportSuccess && (
        <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '1rem', borderRadius: 6, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✓ Data imported successfully! Reloading...
        </div>
      )}

      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: 900,
        }}
      >
        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #ecf0f1' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1.125rem' }}>⚙️ Application Settings</h3>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.875rem' }}>
            Manage your preferences and data
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Data Management */}
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1rem' }}>💾 Data Management</h4>
            <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d', fontSize: '0.875rem' }}>
              Export, import, or clear your journal data
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: 4 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#2c3e50' }}>
                  {stats.entries + stats.bars}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#7f8c8d' }}>
                  Total Items ({stats.entries} beers, {stats.bars} bars)
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleExportData}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                📥 Export Data
              </button>
              <button
                onClick={handleImportData}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#9b59b6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                📤 Import Data
              </button>
              <button
                onClick={handleClearData}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: showConfirm ? '#c0392b' : '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {showConfirm ? '⚠️ Click Again to Confirm' : '🗑️ Clear All Data'}
              </button>
            </div>
            <p style={{ margin: '0.75rem 0 0 0', color: '#7f8c8d', fontSize: '0.75rem' }}>
              💡 Tip: Export your data regularly to keep a backup
            </p>
          </div>

          {/* Storage Info */}
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1rem' }}>💿 Storage Information</h4>
            <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d', fontSize: '0.875rem' }}>
              Your data is stored locally in your browser
            </p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#2c3e50' }}>📝 Journal Entries</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3498db' }}>{stats.entries}</span>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#2c3e50' }}>🏪 Bars & Pubs</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9b59b6' }}>{stats.bars}</span>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: 4 }}>
                <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>Storage Type</div>
                <div style={{ fontSize: '0.875rem', color: '#2c3e50' }}>Browser LocalStorage</div>
              </div>
            </div>
          </div>

          {/* About */}
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1rem' }}>ℹ️ About Ale Tale</h4>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
              <div><strong>Version:</strong> 1.0.0</div>
              <div><strong>Build:</strong> {new Date().getFullYear()}</div>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #ecf0f1' }}>
                A personal beer journaling application to track and remember your favorite brews.
              </div>
            </div>
          </div>

          {/* Future Features */}
          <div style={{ padding: '1.5rem', backgroundColor: '#fff3cd', borderRadius: 6, border: '1px solid #ffc107' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404', fontSize: '1rem' }}>🚀 Coming Soon</h4>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', color: '#856404', fontSize: '0.875rem', lineHeight: 1.6 }}>
              <li>Dark mode theme</li>
              <li>Cloud sync across devices</li>
              <li>Share entries with friends</li>
              <li>Advanced filtering and charts</li>
              <li>Mobile app for iOS and Android</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
