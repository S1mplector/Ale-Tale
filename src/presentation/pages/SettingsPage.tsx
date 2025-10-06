import React from 'react';

export function SettingsPage() {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Settings</h2>
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: 800,
        }}
      >
        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #ecf0f1' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1.125rem' }}>⚙️ Application Settings</h3>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.875rem' }}>
            Manage your preferences and data
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1rem' }}>💾 Data Management</h4>
            <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d', fontSize: '0.875rem' }}>
              Export, import, or clear your journal data
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                disabled
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: '0.875rem',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                }}
              >
                Export Data
              </button>
              <button
                disabled
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#9b59b6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: '0.875rem',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                }}
              >
                Import Data
              </button>
              <button
                disabled
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: '0.875rem',
                  cursor: 'not-allowed',
                  opacity: 0.6,
                }}
              >
                Clear All Data
              </button>
            </div>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1rem' }}>🎨 Display Preferences</h4>
            <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d', fontSize: '0.875rem' }}>
              Customize how your journal appears
            </p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2c3e50' }}>
                <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                <span style={{ fontSize: '0.875rem' }}>Dark Mode</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2c3e50' }}>
                <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                <span style={{ fontSize: '0.875rem' }}>Show beer images on cards</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2c3e50' }}>
                <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                <span style={{ fontSize: '0.875rem' }}>Compact view</span>
              </label>
            </div>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', fontSize: '1rem' }}>🔔 Notifications</h4>
            <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d', fontSize: '0.875rem' }}>
              Manage notification preferences
            </p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2c3e50' }}>
                <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                <span style={{ fontSize: '0.875rem' }}>Remind me to journal new beers</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2c3e50' }}>
                <input type="checkbox" disabled style={{ cursor: 'not-allowed' }} />
                <span style={{ fontSize: '0.875rem' }}>Weekly summary emails</span>
              </label>
            </div>
          </div>
        </div>

        <p style={{ color: '#95a5a6', fontSize: '0.875rem', marginTop: '2rem', textAlign: 'center' }}>
          Settings features coming soon...
        </p>
      </div>
    </div>
  );
}
