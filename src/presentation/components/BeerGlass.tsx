import React from 'react';

interface BeerGlassProps {
  size?: number;
  animate?: boolean;
}

export function BeerGlass({ size = 110, animate = true }: BeerGlassProps) {
  return (
    <>
      <div
        style={{
          position: 'relative',
          width: size,
          height: (size / 110) * 200,
          background: 'rgba(255, 255, 255, 0.15)',
          clipPath: 'polygon(25% 0, 75% 0, 85% 100%, 15% 100%)',
          border: '3px solid rgba(255,255,255,0.4)',
          borderRadius: 4,
          overflow: 'hidden',
          backdropFilter: 'blur(2px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.1)',
        }}
      >
        {/* Beer liquid */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: animate ? '0%' : '82%',
            background: 'linear-gradient(180deg, #F5DEB3 0%, #DAA520 30%, #B8860B 100%)',
            animation: animate ? 'beer-fill 2s ease-out forwards' : 'none',
            clipPath: 'polygon(10% 0, 90% 0, 95% 100%, 5% 100%)',
          }}
        />

        {/* Foam head */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: (size / 110) * 40,
            background: 'linear-gradient(180deg, #FFFEF0 0%, #FFF8DC 50%, rgba(255,255,255,0.9) 100%)',
            clipPath: 'polygon(25% 0, 75% 0, 80% 100%, 20% 100%)',
            animation: animate ? 'beer-foam 2s ease-out 1.2s forwards' : 'none',
            opacity: animate ? 0 : 1,
            filter: 'blur(0.5px)',
          }}
        />

        {/* Glass shine */}
        <div
          style={{
            position: 'absolute',
            top: (size / 110) * 20,
            left: 8,
            width: (size / 110) * 25,
            height: (size / 110) * 140,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
            borderRadius: 12,
            transform: 'skewY(-5deg)',
          }}
        />

        {/* Bubbles */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {[...Array(animate ? 15 : 8)].map((_, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${15 + (i * 6) % 70}%`,
                bottom: 0,
                width: i % 3 === 0 ? 5 : 3,
                height: i % 3 === 0 ? 5 : 3,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                animation: `beer-bubble ${1500 + i * 100}ms ease-in ${animate ? 800 + i * 60 : 0}ms infinite`,
                boxShadow: '0 0 4px rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes beer-fill {
          0% { height: 0%; }
          70% { height: 88%; }
          100% { height: 82%; }
        }
        @keyframes beer-foam {
          0% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 1; transform: translateY(0); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes beer-bubble {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(-180px) scale(1.2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
