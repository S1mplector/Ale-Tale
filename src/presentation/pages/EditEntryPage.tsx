import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getJournalEntryUseCase, updateJournalEntryUseCase } from '@di/container';
import type { JournalEntry } from '@domain/entities/JournalEntry';

export function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [drankAt, setDrankAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getJournalEntryUseCase.execute(id).then((e) => {
      setEntry(e);
      if (e) {
        setRating(e.rating);
        setNotes(e.notes ?? '');
        setLocation(e.location ?? '');
        setDrankAt(new Date(e.drankAt).toISOString().split('T')[0]);
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!entry) return;
    setSaving(true);
    try {
      const updated: JournalEntry = {
        ...entry,
        rating,
        notes,
        location: location || undefined,
        drankAt: new Date(drankAt),
      };
      await updateJournalEntryUseCase.execute(updated);
      navigate(`/entry/${entry.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to update entry');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  if (!entry) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Entry not found</h2>
        <Link to="/" style={{ color: '#3498db', textDecoration: 'none' }}>Back to Journal</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/entry/${entry.id}`} style={{ color: '#3498db', textDecoration: 'none' }}>
          ← Back to Entry
        </Link>
      </div>
      <h2 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Edit Entry</h2>
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
        <div style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
          Editing: <strong>{entry.beerName}</strong> — {entry.brewery} ({entry.style}) {entry.abv}% ABV
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
            placeholder="What did you think?"
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
            disabled={saving}
            style={{
              flex: 1,
              backgroundColor: '#27ae60',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: 4,
              fontSize: '1rem',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
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
