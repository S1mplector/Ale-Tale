import React from 'react';

export function MyBeersPage() {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>My Beer Database</h2>
      <div
        style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍺</div>
        <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Your Personal Beer Collection</h3>
        <p style={{ color: '#7f8c8d', fontSize: '1rem', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
          View all the unique beers you've tried and added to your journal. 
          This feature will display your complete beer database with filtering and sorting options.
        </p>
        <p style={{ color: '#95a5a6', fontSize: '0.875rem', marginTop: '2rem' }}>
          Coming soon...
        </p>
      </div>
    </div>
  );
}
