import React from 'react';

export function StatisticsPage() {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Statistics & Insights</h2>
      <div
        style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
        <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Your Beer Journey Analytics</h3>
        <p style={{ color: '#7f8c8d', fontSize: '1rem', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
          Discover insights about your beer preferences! View top-rated beers, favorite styles, 
          most visited breweries, drinking trends over time, and more.
        </p>
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: 800, margin: '2rem auto 0' }}>
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
            <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>Top Rated Beers</div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
            <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>Favorite Styles</div>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📈</div>
            <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>Drinking Trends</div>
          </div>
        </div>
        <p style={{ color: '#95a5a6', fontSize: '0.875rem', marginTop: '2rem' }}>
          Coming soon...
        </p>
      </div>
    </div>
  );
}
