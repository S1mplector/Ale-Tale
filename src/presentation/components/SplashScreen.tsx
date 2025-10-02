import React, { useEffect, useState } from 'react';
import { BeerGlass } from './BeerGlass';

interface SplashScreenProps {
  onDone: () => void;
  durationMs?: number;
}

export function SplashScreen({ onDone, durationMs = 3400 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'filling' | 'done'>('filling');
  const [typedText, setTypedText] = useState('');
  const fullText = 'Brewlog';

  useEffect(() => {
    // Typing animation - start after 400ms, type one char every 200ms
    const typeDelay = 400;
    const charDelay = 200;
    
    fullText.split('').forEach((char, i) => {
      setTimeout(() => {
        setTypedText(fullText.slice(0, i + 1));
      }, typeDelay + i * charDelay);
    });

    const doneTimer = setTimeout(() => {
      setPhase('done');
      setTimeout(onDone, 600); // Wait for fade out
    }, durationMs);
    
    return () => {
      clearTimeout(doneTimer);
    };
  }, [onDone, durationMs]);

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'opacity 800ms ease',
        opacity: phase === 'done' ? 0 : 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <BeerGlass size={110} animate={true} />
        
        <h1
          style={{
            color: 'white',
            fontSize: '3rem',
            fontWeight: 700,
            margin: 0,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '0.05em',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            minWidth: '280px',
            textAlign: 'center',
          }}
        >
          {typedText}
          <span
            style={{
              opacity: typedText.length < fullText.length ? 1 : 0,
              animation: 'blink 1s step-end infinite',
              marginLeft: '2px',
            }}
          >
            |
          </span>
        </h1>
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
