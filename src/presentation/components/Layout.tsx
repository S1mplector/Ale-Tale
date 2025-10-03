import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BeerGlass } from './BeerGlass';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const accent = '#f1c40f';
  const active = (path: string) => (location.pathname === path ? accent : 'transparent');
  const activeColor = (path: string) => (location.pathname === path ? accent : '#ecf0f1');
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <nav
        style={{
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: '1rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            to="/"
            style={{
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{ transform: 'scale(0.35)', transformOrigin: 'left center' }}>
              <BeerGlass size={55} animate={false} />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Ale Tale</h1>
          </Link>
          <Link
            to="/add"
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: 4,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            + New Entry
          </Link>
        </div>
      </nav>
      {/* Sub-navigation */}
      <div style={{ background: '#34495e' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/" style={{
              color: activeColor('/'),
              textDecoration: 'none',
              padding: '0.5rem 0.75rem',
              borderBottom: `3px solid ${active('/')}`,
            }}>Beers</Link>
            <Link to="/bars" style={{
              color: activeColor('/bars'),
              textDecoration: 'none',
              padding: '0.5rem 0.75rem',
              borderBottom: `3px solid ${active('/bars')}`,
            }}>Bars</Link>
            <Link to="/log" style={{
              color: activeColor('/log'),
              textDecoration: 'none',
              padding: '0.5rem 0.75rem',
              borderBottom: `3px solid ${active('/log')}`,
            }}>Log</Link>
          </div>
        </div>
      </div>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>{children}</main>
    </div>
  );
}
