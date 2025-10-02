import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJournalEntryUseCase, listBeersUseCase } from '@di/container';
import type { Beer } from '@domain/entities/Beer';

export function AddEntryPage() {
  const navigate = useNavigate();
  const [beers, setBeers] = useState<Beer[]>([]);
  const [selectedBeer, setSelectedBeer] = useState<Beer | null>(null);
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [drankAt, setDrankAt] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    listBeersUseCase.execute().then(setBeers);
  }, []);

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
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: 600,
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Beer *
          </label>
          <select
            value={selectedBeer?.id || ''}
            onChange={(e) => setSelectedBeer(beers.find((b) => b.id === e.target.value) || null)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: 4,
            }}
            required
          >
            <option value="">Select a beer...</option>
            {beers.map((beer) => (
              <option key={beer.id} value={beer.id}>
                {beer.name} - {beer.brewery}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Rating * ({rating}/5)
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Date *
          </label>
          <input
            type="date"
            value={drankAt}
            onChange={(e) => setDrankAt(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: 4,
            }}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where did you drink it?"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: 4,
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Tasting Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you think? Describe the taste, aroma, appearance..."
            rows={6}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading || !selectedBeer}
            style={{
              flex: 1,
              backgroundColor: '#3498db',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: 4,
              fontSize: '1rem',
              fontWeight: 500,
              cursor: loading || !selectedBeer ? 'not-allowed' : 'pointer',
              opacity: loading || !selectedBeer ? 0.6 : 1,
            }}
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '1rem',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
