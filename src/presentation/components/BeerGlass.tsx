import React from 'react';

interface BeerGlassProps {
  size?: number;
  animate?: boolean;
}

export function BeerGlass({ size = 110, animate = true }: BeerGlassProps) {
  return (
    <>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'flex-end' }}>
        {/* Beer Mug Glass */}
        <div
          style={{
            position: 'relative',
            width: size,
            height: (size / 110) * 200,
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.18) 100%)',
            borderRadius: '8px 8px 0 0',
            overflow: 'hidden',
            backdropFilter: 'blur(4px)',
            border: '2px solid rgba(255,255,255,0.4)',
            borderBottom: `${(size / 110) * 12}px solid rgba(255,255,255,0.35)`,
            boxShadow: `
              0 10px 40px rgba(0,0,0,0.3),
              inset 0 0 30px rgba(255,255,255,0.12),
              inset -3px 0 15px rgba(255,255,255,0.2),
              inset 3px 0 8px rgba(0,0,0,0.1)
            `,
          }}
        >
          {/* Beer liquid (now wraps foam so foam rides the surface) */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: animate ? '0%' : '80%',
              background: 'linear-gradient(180deg, #FFD97D 0%, #F4A460 15%, #DAA520 40%, #C19A00 70%, #8B6914 100%)',
              animation: animate ? 'beer-fill 2s ease-out forwards' : 'none',
              boxShadow: 'inset 0 0 30px rgba(139, 105, 20, 0.4)',
              zIndex: 2,
            }}
          >
            {/* Foam snapped to surface */}
            <div
              style={{
                position: 'absolute',
                top: -(size / 110) * 10,
                left: (size / 110) * 5,
                right: (size / 110) * 5,
                height: (size / 110) * 18,
                background: 'linear-gradient(180deg, rgba(255,254,251,0.95) 0%, rgba(255,246,224,0.92) 55%, rgba(241,231,198,0.9) 100%)',
                borderRadius: '6px 6px 10px 10px',
                opacity: animate ? 0 : 0.98,
                boxShadow: 'inset 0 -3px 6px rgba(218,165,32,0.15), 0 1px 4px rgba(255,255,255,0.18)',
                overflow: 'hidden',
                WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 70%, rgba(0,0,0,0.85) 100%)',
                maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 70%, rgba(0,0,0,0.85) 100%)',
                animation: animate ? 'beer-foam 900ms ease-out 1100ms forwards' : 'none',
                zIndex: 3,
              }}
            >
              {/* Soft top feather */}
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: (size / 110) * 5,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.35))',
                  opacity: 0.28,
                  pointerEvents: 'none',
                }}
              />
              {/* Foam bubbles */}
              <div
                style={{
                  position: 'absolute',
                  top: (size / 110) * 3,
                  left: (size / 110) * 2,
                  right: (size / 110) * 2,
                  height: (size / 110) * 10,
                  opacity: animate ? 0 : 0.25,
                }}
              >
                {[...Array(14)].map((_, i) => (
                  <span
                    key={`foam-${i}`}
                    style={{
                      position: 'absolute',
                      left: `${4 + (i * 12) % 92}%`,
                      top: `${(i * 17) % 90}%`,
                      width: i % 3 === 0 ? 5 : 4,
                      height: i % 3 === 0 ? 5 : 4,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8), rgba(255,248,220,0.2))',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Subtle beer surface highlight right below foam */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: (size / 110) * 6,
                right: (size / 110) * 6,
                height: (size / 110) * 8,
                background: 'linear-gradient(180deg, rgba(255,246,224,0.45) 0%, rgba(255,246,224,0.18) 55%, rgba(255,246,224,0) 100%)',
                opacity: 0.35,
                pointerEvents: 'none',
              }}
            />

            {/* Bubbles inside the beer */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                pointerEvents: 'none',
                WebkitMaskImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) ${(size / 110) * 12}px, rgba(0,0,0,1) calc(100% - ${(size / 110) * 14}px), rgba(0,0,0,0) 100%)`,
                maskImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) ${(size / 110) * 12}px, rgba(0,0,0,1) calc(100% - ${(size / 110) * 14}px), rgba(0,0,0,0) 100%)`,
              }}
            >
              {[...Array(animate ? 18 : 10)].map((_, i) => (
                <span
                  key={`bubble-${i}`}
                  style={{
                    position: 'absolute',
                    left: `${20 + (i * 7) % 60}%`,
                    bottom: 0,
                    width: i % 4 === 0 ? 6 : i % 3 === 0 ? 4 : 3,
                    height: i % 4 === 0 ? 6 : i % 3 === 0 ? 4 : 3,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
                    animation: `beer-bubble ${1400 + i * 120}ms ease-in ${animate ? 1000 + i * 70 : 0}ms infinite`,
                    boxShadow: '0 0 6px rgba(255,255,255,0.6), inset 0 0 3px rgba(255,255,255,0.8)',
                    willChange: 'transform, opacity',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Primary glass shine */}
          <div
            style={{
              position: 'absolute',
              top: (size / 110) * 15,
              left: 10,
              width: (size / 110) * 20,
              height: (size / 110) * 150,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              borderRadius: '20px 8px 8px 20px',
              transform: 'skewY(-3deg)',
            }}
          />

          {/* Secondary glass shine */}
          <div
            style={{
              position: 'absolute',
              top: (size / 110) * 30,
              right: 8,
              width: (size / 110) * 12,
              height: (size / 110) * 100,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 100%)',
              borderRadius: 8,
              transform: 'skewY(2deg)',
            }}
          />

          {/* Condensation droplets */}
          <div style={{ position: 'absolute', inset: 0 }}>
            {[...Array(8)].map((_, i) => (
              <span
                key={`drop-${i}`}
                style={{
                  position: 'absolute',
                  left: `${20 + (i * 11) % 60}%`,
                  top: `${30 + (i * 23) % 50}%`,
                  width: i % 3 === 0 ? 6 : 4,
                  height: i % 3 === 0 ? 8 : 6,
                  borderRadius: '50% 50% 50% 70%',
                  background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.9), rgba(255,255,255,0.3))',
                  transform: 'rotate(45deg)',
                  opacity: 0.7,
                  animation: `condensation-drip ${3000 + i * 500}ms ease-in ${animate ? 2000 + i * 200 : 0}ms infinite`,
                }}
              />
            ))}
          </div>

        </div>

        {/* Beer Mug Handle */}
        <div
          style={{
            position: 'absolute',
            right: -(size / 110) * 35,
            top: (size / 110) * 50,
            width: (size / 110) * 45,
            height: (size / 110) * 90,
            border: '3px solid rgba(255,255,255,0.4)',
            borderLeft: 'none',
            borderRadius: '0 50% 50% 0',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.15) 100%)',
            backdropFilter: 'blur(3px)',
            boxShadow: `
              inset -2px 0 8px rgba(255,255,255,0.2),
              inset 2px 0 8px rgba(0,0,0,0.1),
              2px 4px 12px rgba(0,0,0,0.2)
            `,
          }}
        >
          {/* Handle inner highlight */}
          <div
            style={{
              position: 'absolute',
              right: 8,
              top: '20%',
              width: '30%',
              height: '60%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 100%)',
              borderRadius: '0 40% 40% 0',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes beer-fill {
          0% { height: 0%; }
          60% { height: 85%; }
          100% { height: 80%; }
        }
        @keyframes beer-foam {
          0% { opacity: 0; transform: translateY(25px) scale(0.8); }
          40% { opacity: 0.8; transform: translateY(5px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes beer-bubble {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(-190px) scale(1.3); opacity: 0; }
        }
        @keyframes condensation-drip {
          0% { transform: rotate(45deg) translateY(0); opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: rotate(45deg) translateY(15px); opacity: 0; }
        }
      `}</style>
    </>
  );
}
