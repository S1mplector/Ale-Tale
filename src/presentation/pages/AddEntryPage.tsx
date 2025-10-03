import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJournalEntryUseCase, listBeersUseCase } from '@di/container';
import type { Beer } from '@domain/entities/Beer';
import { searchBeers } from '@infrastructure/services/BeerSearchService';

export function AddEntryPage() {
  const navigate = useNavigate();
  const [beers, setBeers] = useState<Beer[]>([]);
  const [selectedBeer, setSelectedBeer] = useState<Beer | null>(null);
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [drankAt, setDrankAt] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Beer[]>([]);

  React.useEffect(() => {
    listBeersUseCase.execute().then(setBeers);
  }, []);

  // Debounced async search using our API (Untappd scraper with fallback)
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const items = await searchBeers(query.trim());
        setResults(items);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeer) return;

    setLoading(true);
    try {
      await createJournalEntryUseCase.execute({
        beerId: selectedBeer.id,
        beerName: selectedBeer.name,
        brewery: selectedBeer.brewery,
        style: selectedBeer.style,
        abv: selectedBeer.abv,
        rating,
        notes,
        location: location || undefined,
        drankAt: new Date(drankAt),
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to create entry:', error);
      alert('Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Add Journal Entry</h2>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', alignItems: 'center' }}>
        <span style={{ padding: '4px 8px', borderRadius: 999, background: step === 'select' ? '#3498db' : '#ecf0f1', color: step === 'select' ? 'white' : '#2c3e50' }}>1. Select Beer</span>
        <span style={{ height: 1, background: '#ccc', flex: 1 }} />
        <span style={{ padding: '4px 8px', borderRadius: 999, background: step === 'details' ? '#3498db' : '#ecf0f1', color: step === 'details' ? 'white' : '#2c3e50' }}>2. Details</span>
      </div>

      {/* Step 1: async search */}
      {step === 'select' && (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: 600, marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Search a beer</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search Untappd..."
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }}
            autoFocus
          />
          <div style={{ marginTop: '0.75rem', maxHeight: 260, overflow: 'auto', border: results.length ? '1px solid #eee' : 'none', borderRadius: 6 }}>
            {searching && <div style={{ padding: '0.75rem', color: '#7f8c8d' }}>Searching…</div>}
            {!searching && query && results.length === 0 && <div style={{ padding: '0.75rem', color: '#7f8c8d' }}>No results</div>}
            {results.map((beer) => (
              <button
                key={beer.id}
                type="button"
                onClick={() => {
                  setSelectedBeer(beer);
                  setStep('details');
                }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'white', border: 'none', borderTop: '1px solid #f2f2f2', cursor: 'pointer' }}
              >
                <span>
                  <strong>{beer.name}</strong>
                  <span style={{ color: '#7f8c8d' }}> — {beer.brewery}</span>
                </span>
                <span style={{ color: '#7f8c8d', fontSize: 12 }}>{beer.style}</span>
              </button>
            ))}
          </div>

          {/* Fallback: local list */}
          {results.length === 0 && !searching && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Or pick from local list</label>
              <select
                value={selectedBeer?.id || ''}
                onChange={(e) => setSelectedBeer(beers.find((b) => b.id === e.target.value) || null)}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }}
              >
                <option value="">Select a beer...</option>
                {beers.map((beer) => (
                  <option key={beer.id} value={beer.id}>
                    {beer.name} - {beer.brewery}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              disabled={!selectedBeer}
              onClick={() => selectedBeer && setStep('details')}
              style={{ backgroundColor: '#3498db', color: 'white', padding: '0.6rem 1rem', border: 'none', borderRadius: 4, cursor: !selectedBeer ? 'not-allowed' : 'pointer', opacity: !selectedBeer ? 0.6 : 1 }}
            >
              Continue
            </button>
            <button type="button" onClick={() => navigate('/')} style={{ padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: 4, background: 'white' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step 2: details */}
      {step === 'details' && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: 600 }}>
          <div style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
            <div>Beer selected:</div>
            <div>
              <strong>{selectedBeer?.name}</strong> — {selectedBeer?.brewery}
            </div>
            <button type="button" onClick={() => setStep('select')} style={{ marginTop: 8, border: 'none', background: 'transparent', color: '#3498db', cursor: 'pointer' }}>
              Change
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rating * ({rating}/5)</label>
            <input type="range" min="0" max="5" step="0.5" value={rating} onChange={(e) => setRating(parseFloat(e.target.value))} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date *</label>
            <input
              type="date"
              value={drankAt}
              onChange={(e) => setDrankAt(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where did you drink it?" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tasting Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you think? Describe the taste, aroma, appearance..."
              rows={6}
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading || !selectedBeer}
              style={{ flex: 1, backgroundColor: '#3498db', color: 'white', padding: '0.75rem', border: 'none', borderRadius: 4, fontSize: '1rem', fontWeight: 500, cursor: loading || !selectedBeer ? 'not-allowed' : 'pointer', opacity: loading || !selectedBeer ? 0.6 : 1 }}
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
            <button type="button" onClick={() => navigate('/')} style={{ padding: '0.75rem 1.5rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem', backgroundColor: 'white', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
