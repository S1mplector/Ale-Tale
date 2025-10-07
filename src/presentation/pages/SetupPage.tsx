import React, { useState } from 'react';
import { BeerGlass } from '@presentation/components/BeerGlass';

interface SetupPageProps {
  onComplete: () => void;
}

export function SetupPage({ onComplete }: SetupPageProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectDirectory = async () => {
    setIsSelecting(true);
    setError(null);

    try {
      // Check if File System Access API is supported
      if (!('showDirectoryPicker' in window)) {
        setError(
          'Your browser does not support the File System Access API. ' +
          'Please use a modern browser like Chrome, Edge, or Opera.'
        );
        setIsSelecting(false);
        return;
      }

      const { storageAdapter } = await import('@infrastructure/storage/StorageAdapter');
      const success = await storageAdapter.setupFileSystem();

      if (success) {
        onComplete();
      } else {
        setIsSelecting(false);
      }
    } catch (err) {
      console.error('Error selecting directory:', err);
      setError((err as Error).message || 'Failed to select directory');
      setIsSelecting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <BeerGlass size={80} animate={true} />
          </div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'white' }}>
            Welcome to Ale Tale
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
            Your personal beer journaling companion
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#2c3e50' }}>
              Choose Your Data Directory
            </h2>
            <p style={{ margin: '0 0 1rem 0', color: '#555', lineHeight: 1.6 }}>
              Ale Tale stores all your beer journal entries, bars, and photos as files on your computer.
              This gives you complete control and ownership of your data.
            </p>
            <p style={{ margin: 0, color: '#555', lineHeight: 1.6 }}>
              Select a folder where you'd like to save your Ale Tale data. We recommend creating a new
              folder called "Ale Tale" in your Documents or Desktop.
            </p>
          </div>

          {/* Features */}
          <div
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: 8,
              padding: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#2c3e50' }}>
              What you get:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#555', lineHeight: 1.8 }}>
              <li><strong>Full data ownership</strong> – Your data stays on your computer</li>
              <li><strong>Easy backups</strong> – Simply copy the folder</li>
              <li><strong>Portable</strong> – Move your data between devices</li>
              <li><strong>Human-readable</strong> – Data stored as JSON files</li>
              <li><strong>Private</strong> – No cloud, no tracking</li>
            </ul>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: 6,
                padding: '1rem',
                marginBottom: '1.5rem',
                color: '#c33',
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleSelectDirectory}
            disabled={isSelecting}
            style={{
              width: '100%',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'white',
              backgroundColor: isSelecting ? '#95a5a6' : '#27ae60',
              border: 'none',
              borderRadius: 8,
              cursor: isSelecting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isSelecting) {
                e.currentTarget.style.backgroundColor = '#229954';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(39, 174, 96, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelecting) {
                e.currentTarget.style.backgroundColor = '#27ae60';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
              }
            }}
          >
            {isSelecting ? 'Selecting Directory...' : '📁 Choose Directory'}
          </button>

          {/* Note */}
          <p
            style={{
              marginTop: '1.5rem',
              fontSize: '0.875rem',
              color: '#7f8c8d',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            You can change this location later in Settings
          </p>
        </div>
      </div>
    </div>
  );
}
