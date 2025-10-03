import React, { useState } from 'react';
import type { Beer } from '@domain/entities/Beer';

interface ManualBeerFormProps {
  onUse: (beer: Beer) => void;
  onCancel: () => void;
}

export function ManualBeerForm({ onUse, onCancel }: ManualBeerFormProps) {
  const [name, setName] = useState('');
  const [brewery, setBrewery] = useState('');
  const [style, setStyle] = useState('');
  const [abv, setAbv] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const canSubmit = name.trim().length > 0 && brewery.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const payload = {
        id: `manual:${Date.now()}:${name.trim().toLowerCase().replace(/\s+/g, '-')}:${brewery.trim().toLowerCase().replace(/\s+/g, '-')}`,
        name: name.trim(),
        brewery: brewery.trim(),
        style: style.trim(),
        abv: abv ? parseFloat(abv) || 0 : 0,
      };
      // Persist to backend so it appears in future searches and aggregate results
      let serverBeer: Beer | null = null;
      try {
        const resp = await fetch('/api/beer/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (resp.ok) serverBeer = await resp.json();
      } catch {}

      onUse((serverBeer as Beer) || (payload as Beer));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: 6 }}>Beer name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Carlsberg Pilsner"
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
          required
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 6 }}>Brewery *</label>
        <input
          type="text"
          value={brewery}
          onChange={(e) => setBrewery(e.target.value)}
          placeholder="e.g., Carlsberg Group"
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
          required
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 6 }}>Style</label>
        <input
          type="text"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="e.g., Pilsner"
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 6 }}>ABV %</label>
        <input
          type="number"
          min="0"
          max="20"
          step="0.1"
          value={abv}
          onChange={(e) => setAbv(e.target.value)}
          placeholder="e.g., 5.0"
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: 4 }}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={!canSubmit || saving}
          style={{ backgroundColor: '#27ae60', color: 'white', padding: '0.6rem 1rem', border: 'none', borderRadius: 4, cursor: !canSubmit || saving ? 'not-allowed' : 'pointer', opacity: !canSubmit || saving ? 0.6 : 1 }}
        >
          Use this beer
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: 4, background: 'white' }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
