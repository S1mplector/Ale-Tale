import React, { useEffect, useState } from 'react';
import { listBeersUseCase } from '@di/container';
import type { Beer } from '@domain/entities/Beer';

export function HomePage() {
  const [beers, setBeers] = useState<Beer[]>([]);

  useEffect(() => {
    listBeersUseCase.execute().then(setBeers);
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Brewlog</h1>
      <p>Track and journal your beers.</p>
      <ul>
        {beers.map((b) => (
          <li key={b.id}>
            <strong>{b.name}</strong> — {b.brewery} ({b.style}) {b.abv}% ABV
          </li>
        ))}
      </ul>
    </main>
  );
}
