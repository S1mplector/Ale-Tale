import React from 'react';

export function SearchPage() {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Search</h2>
      <div
        style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
        <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Global Search</h3>
        <p style={{ color: '#7f8c8d', fontSize: '1rem', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
          Search across all your journal entries, beers, bars, and notes. 
          Find that perfect beer you tried months ago or locate all entries from a specific location.
        </p>
        <div style={{ marginTop: '2rem', maxWidth: 600, margin: '2rem auto 0' }}>
          <input
            type="text"
            placeholder="Search beers, bars, notes..."
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              border: '2px solid #ddd',
              borderRadius: 8,
              boxSizing: 'border-box',
            }}
            disabled
          />
        </div>
        <p style={{ color: '#95a5a6', fontSize: '0.875rem', marginTop: '2rem' }}>
          Coming soon...
        </p>
      </div>
    </div>
  );
}
