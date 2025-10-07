import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BeerGlass } from './BeerGlass';
import { MAX_WIDTH, SUBNAV_MAX_WIDTH, NAV_HORIZONTAL_PADDING, PAGE_PADDING } from '@presentation/constants/layout';
import { SPLASH_TEXTS } from '@presentation/constants/splashTexts';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const accent = '#f1c40f';
  const active = (path: string) => (location.pathname === path ? accent : 'transparent');
  const activeColor = (path: string) => (location.pathname === path ? accent : '#ecf0f1');
  
  const [splashText, setSplashText] = useState('');
  
  useEffect(() => {
    const randomSplash = SPLASH_TEXTS[Math.floor(Math.random() * SPLASH_TEXTS.length)];
    setSplashText(randomSplash);
  }, []);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <nav
        style={{
          backgroundColor: '#2c3e50',
          color: 'white',
          padding: `0.75rem ${NAV_HORIZONTAL_PADDING}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            maxWidth: MAX_WIDTH,
            margin: '0 auto',
            display: 'flex',
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
            <div style={{ position: 'relative' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Ale Tale</h1>
              {splashText && (
                <>
                  <style>{`
                    @keyframes splash-pulse {
                      0%, 100% { transform: translateX(-50%) rotate(-5deg) scale(1); }
                      50% { transform: translateX(-50%) rotate(-5deg) scale(1.1); }
                    }
                  `}</style>
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(-5deg)',
                      fontSize: '0.75rem',
                      color: '#f1c40f',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      marginTop: '0.25rem',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                      animation: 'splash-pulse 2s ease-in-out infinite',
                    }}
                  >
                    {splashText}
                  </div>
                </>
              )}
            </div>
          </Link>

          {/* Main Navigation */}
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <Link
              to="/my-beers"
              style={{
                color: '#ecf0f1',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 4,
                fontSize: '0.9375rem',
                fontWeight: 500,
                backgroundColor: location.pathname === '/my-beers' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = location.pathname === '/my-beers' ? 'rgba(255,255,255,0.1)' : 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.9 }}>
                <rect x="1" y="1" width="5.5" height="5.5" rx="1" />
                <rect x="9" y="1" width="5.5" height="5.5" rx="1" />
                <rect x="1" y="9" width="5.5" height="5.5" rx="1" />
                <rect x="9" y="9" width="5.5" height="5.5" rx="1" />
              </svg>
              Beer Database
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
                backgroundColor: location.pathname === '/statistics' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = location.pathname === '/statistics' ? 'rgba(255,255,255,0.1)' : 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.9 }}>
                <rect x="2" y="10" width="3" height="4" rx="0.5" />
                <rect x="6.5" y="6" width="3" height="8" rx="0.5" />
                <rect x="11" y="2" width="3" height="12" rx="0.5" />
              </svg>
              Statistics
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
                backgroundColor: location.pathname === '/search' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = location.pathname === '/search' ? 'rgba(255,255,255,0.1)' : 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.9 }}>
                <circle cx="6.5" cy="6.5" r="4.5" />
                <line x1="10" y1="10" x2="14" y2="14" />
              </svg>
              Search
            </Link>
            <Link
              to="/settings"
              style={{
                color: '#ecf0f1',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 4,
                fontSize: '0.9375rem',
                fontWeight: 500,
                backgroundColor: location.pathname === '/settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = location.pathname === '/settings' ? 'rgba(255,255,255,0.1)' : 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                <circle cx="8" cy="8" r="2.5" />
                <path d="M8 1 L8 3 M8 13 L8 15 M1 8 L3 8 M13 8 L15 8 M3.5 3.5 L4.9 4.9 M11.1 11.1 L12.5 12.5 M3.5 12.5 L4.9 11.1 M11.1 4.9 L12.5 3.5" />
              </svg>
              Settings
            </Link>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

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
          </div>
        </div>
      </nav>
      {/* Sub-navigation */}
      <div style={{ background: '#34495e' }}>
        <div style={{ maxWidth: SUBNAV_MAX_WIDTH, margin: '0 auto', padding: `0 ${NAV_HORIZONTAL_PADDING}` }}>
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
      <main style={{ maxWidth: MAX_WIDTH, margin: '0 auto', padding: PAGE_PADDING }}>{children}</main>
    </div>
  );
}
