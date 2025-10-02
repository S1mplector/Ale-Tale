import React, { useEffect, useState } from 'react';
import { BeerGlass } from './BeerGlass';

interface SplashScreenProps {
  onDone: () => void;
  durationMs?: number;
}

export function SplashScreen({ onDone, durationMs = 2800 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'filling' | 'done'>('filling');

  useEffect(() => {
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onDone();
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
        transition: 'opacity 600ms ease',
        opacity: phase === 'done' ? 0 : 1,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BeerGlass size={110} animate={true} />
      </div>
    </div>
  );
}
