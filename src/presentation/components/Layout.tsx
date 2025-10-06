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
          padding: '0.75rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          {/* Logo/Brand */}
          <Link
            to="/"
            style={{
              color: 'white',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexShrink: 0,
            }}
          >
            <div style={{ transform: 'scale(0.35)', transformOrigin: 'left center' }}>
              <BeerGlass size={55} animate={false} />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Ale Tale</h1>
          </Link>

          {/* Center Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <Link
              to="/my-beers"
              style={{
                color: '#ecf0f1',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 4,
                fontSize: '0.9375rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: location.pathname === '/my-beers' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = location.pathname === '/my-beers' ? 'rgba(255,255,255,0.1)' : 'transparent'}
            >
              🍺 My Beers
            </Link>
            <Link
              to="/statistics"
              style={{
                color: '#ecf0f1',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 4,
                fontSize: '0.9375rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: location.pathname === '/statistics' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = location.pathname === '/statistics' ? 'rgba(255,255,255,0.1)' : 'transparent'}
            >
              📊 Statistics
            </Link>
            <Link
              to="/search"
              style={{
                color: '#ecf0f1',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 4,
                fontSize: '0.9375rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: location.pathname === '/search' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = location.pathname === '/search' ? 'rgba(255,255,255,0.1)' : 'transparent'}
            >
              🔍 Search
            </Link>
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
            <Link
              to="/add"
              style={{
                backgroundColor: '#27ae60',
                color: 'white',
                padding: '0.625rem 1.25rem',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              + New Entry
            </Link>
            <Link
              to="/settings"
              style={{
                color: '#ecf0f1',
                textDecoration: 'none',
                padding: '0.5rem',
                borderRadius: 4,
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: location.pathname === '/settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background-color 0.2s',
              }}
              title="Settings"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = location.pathname === '/settings' ? 'rgba(255,255,255,0.1)' : 'transparent'}
            >
              ⚙️
            </Link>
          </div>
        </div>
      </nav>
      {/* Sub-navigation */}
      <div style={{ background: '#34495e' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem' }}>
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
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>{children}</main>
    </div>
  );
}
