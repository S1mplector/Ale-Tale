import React from 'react';

export function LogPage() {
  return (
    <div>
      <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Log</h2>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <p style={{ color: '#7f8c8d', margin: 0 }}>
          This is a placeholder for time-based logging. You will be able to log beers you had at
          specific time points here.
        </p>
      </div>
    </div>
  );
}
