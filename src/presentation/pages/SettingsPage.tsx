import React, { useEffect, useState } from 'react';
import { listJournalEntriesUseCase, listBarsUseCase } from '@di/container';
import { storageAdapter } from '@infrastructure/storage/StorageAdapter';
import { CloudSyncSettings } from '@presentation/components/CloudSyncSettings';

export function SettingsPage() {
  const [stats, setStats] = useState({ entries: 0, bars: 0 });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [directoryName, setDirectoryName] = useState<string | null>(null);
  const [isChangingDirectory, setIsChangingDirectory] = useState(false);
  const [usageBytes, setUsageBytes] = useState<number | null>(null);
  const [quotaBytes, setQuotaBytes] = useState<number | null>(null);

  useEffect(() => {
    loadStats();
    loadEstimate();
  }, []);

  const loadStats = async () => {
    const [entries, bars] = await Promise.all([
      listJournalEntriesUseCase.execute(),
      listBarsUseCase.execute(),
    ]);
    setStats({ entries: entries.length, bars: bars.length });
    setDirectoryName(storageAdapter.getDirectoryName());
  };

  const loadEstimate = async () => {
    try {
      const est = await storageAdapter.getStorageEstimate();
      setUsageBytes(est.usage ?? null);
      setQuotaBytes(est.quota ?? null);
    } catch (e) {
      setUsageBytes(null);
      setQuotaBytes(null);
    }
  };

  const handleChangeDirectory = async () => {
    if (!storageAdapter.isFileSystemSupported()) {
      alert('File System Access API is not supported in your browser. Using localStorage instead.');
      return;
    }

    const confirmChange = storageAdapter.isUsingFileSystem()
      ? 'Are you sure you want to change the data directory? Your current data will remain in the old location.'
      : 'Switch to file-based storage? Your current localStorage data will be migrated to the selected directory.';

    if (!window.confirm(confirmChange)) {
      return;
    }

    setIsChangingDirectory(true);
    try {
      const success = await storageAdapter.changeToFileSystem();
      if (success) {
        setDirectoryName(storageAdapter.getDirectoryName());
        alert('Directory setup successful! The page will reload to apply changes.');
        window.location.reload();
      } else {
        alert('Directory selection was cancelled.');
      }
    } catch (error) {
      console.error('Error changing directory:', error);
      alert('Failed to change directory. Please try again.');
    } finally {
      setIsChangingDirectory(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Get all data from current storage backend
      const exportData = await storageAdapter.exportAllData();

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
      await loadEstimate();
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

        // Import data using storage adapter
        await storageAdapter.importAllData(importData);

        setShowImportSuccess(true);
        setTimeout(() => {
          setShowImportSuccess(false);
          window.location.reload();
        }, 2000);
        await loadEstimate();
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import data. Please check the file format and try again.');
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (showConfirm) {
      try {
        await storageAdapter.delete('journal_entries');
        await storageAdapter.delete('bars');
        setShowConfirm(false);
        window.location.reload();
        await loadEstimate();
      } catch (error) {
        console.error('Clear data failed:', error);
        alert('Failed to clear data. Please try again.');
      }
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
          {/* Directory Management */}
          <div style={{ padding: '1.5rem', backgroundColor: '#e8f4f8', borderRadius: 6, border: '1px solid #3498db' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1rem' }}>📁 Data Directory</h4>
            <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d', fontSize: '0.875rem' }}>
              All your journal data is stored in this directory. If your browser supports it, you can switch to file-based storage.
            </p>
            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: 4, marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
                {storageAdapter.isUsingFileSystem() ? 'Current Directory' : 'Storage Type'}
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#2c3e50', fontFamily: 'monospace' }}>
                {storageAdapter.isUsingFileSystem() 
                  ? (directoryName || 'Not set')
                  : storageAdapter.getStorageTypeName()}
              </div>
            </div>
            <button
              onClick={handleChangeDirectory}
              disabled={isChangingDirectory}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: isChangingDirectory ? '#95a5a6' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: isChangingDirectory ? 'not-allowed' : 'pointer',
              }}
            >
              {isChangingDirectory
                ? '⏳ Working...'
                : storageAdapter.isFileSystemSupported()
                  ? (storageAdapter.isUsingFileSystem() ? '🔄 Change Directory' : '📁 Enable File-Based Storage')
                  : 'ℹ️ Learn How to Enable File Storage'}
            </button>
            <p style={{ margin: '0.75rem 0 0 0', color: '#7f8c8d', fontSize: '0.75rem' }}>
              {storageAdapter.isFileSystemSupported()
                ? (storageAdapter.isUsingFileSystem()
                    ? '💡 Choose a new directory to store your data. Data will be migrated automatically.'
                    : '💡 Switch to file-based storage for better data control and portability.')
                : '💡 File-based storage requires a Chromium-based browser (Chrome, Edge, Opera) in a secure context (https or localhost).'}
            </p>
          </div>

          {/* Cloud Sync */}
          <CloudSyncSettings />

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
              <div style={{ flex: 2, minWidth: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.8125rem', color: '#2c3e50' }}>Storage Usage</span>
                  <span style={{ fontSize: '0.8125rem', color: '#7f8c8d' }}>
                    {usageBytes !== null && quotaBytes !== null
                      ? `${(usageBytes / (1024*1024)).toFixed(2)} MB / ${(quotaBytes / (1024*1024)).toFixed(0)} MB`
                      : 'Estimating...'}
                  </span>
                </div>
                <div style={{ height: 8, backgroundColor: '#ecf0f1', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: usageBytes !== null && quotaBytes ? `${Math.min(100, Math.max(0, (usageBytes / quotaBytes) * 100)).toFixed(1)}%` : '0%',
                      background: 'linear-gradient(90deg, #27ae60, #2ecc71)',
                      transition: 'width 200ms ease-out'
                    }}
                  />
                </div>
                <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>
                    {storageAdapter.getStorageTypeName()} {quotaBytes ? '(quota estimate)' : ''}
                  </div>
                  <button
                    onClick={loadEstimate}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#95a5a6',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    ↻ Refresh Usage
                  </button>
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
              Your data is stored as JSON files on your computer
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
                <div style={{ fontSize: '0.875rem', color: '#2c3e50' }}>
                  {storageAdapter.getStorageTypeName()}
                </div>
              </div>
              {storageAdapter.isUsingFileSystem() && (
                <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: 4 }}>
                  <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>Data Files</div>
                  <div style={{ fontSize: '0.8125rem', color: '#2c3e50', fontFamily: 'monospace' }}>
                    journal_entries.json<br />
                    bars.json<br />
                    settings.json
                  </div>
                </div>
              )}
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
              <li>Automatic backups</li>
              <li>Export to PDF reports</li>
              <li>Advanced filtering and charts</li>
              <li>Tasting note templates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
