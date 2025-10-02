import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listJournalEntriesUseCase, deleteJournalEntryUseCase } from '@di/container';
import type { JournalEntry } from '@domain/entities/JournalEntry';

export function HomePage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);

  const loadEntries = async () => {
    setLoading(true);
    const data = await listJournalEntriesUseCase.execute();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    await deleteJournalEntryUseCase.execute(id);
    loadEntries();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('★');
      } else if (rating >= i - 0.5) {
        stars.push('½');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = entries.filter((e) => {
    const matchesText = normalizedQuery
      ? (
          e.beerName.toLowerCase().includes(normalizedQuery) ||
          e.brewery.toLowerCase().includes(normalizedQuery) ||
          e.style.toLowerCase().includes(normalizedQuery)
        )
      : true;
    const matchesRating = e.rating >= minRating && e.rating <= maxRating;
    return matchesText && matchesRating;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>No journal entries yet</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
          Start tracking your beer experiences by adding your first entry!
        </p>
        <Link
          to="/add"
          style={{
            display: 'inline-block',
            backgroundColor: '#3498db',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: 4,
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Add Your First Entry
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
        Your Journal ({filtered.length} {filtered.length === 1 ? 'entry' : 'entries'})
      </h2>

      {/* Toolbar */}
      <div
        style={{
          display: 'grid',
          gap: '0.75rem',
          backgroundColor: 'white',
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by beer, brewery, or style"
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: 4,
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#7f8c8d' }}>
                Min Rating: {minRating}
              </label>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#7f8c8d' }}>
                Max Rating: {maxRating}
              </label>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={maxRating}
                onChange={(e) => setMaxRating(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: '#95a5a6' }}>
            Showing {filtered.length} of {entries.length} entries
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {filtered.map((entry) => (
          <div
            key={entry.id}
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: 8,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'grid',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <Link
                  to={`/entry/${entry.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.25rem' }}>
                    {entry.beerName}
                  </h3>
                </Link>
                <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.875rem' }}>
                  {entry.brewery} • {entry.style} • {entry.abv}% ABV
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '1.5rem',
                    color: '#f39c12',
                    marginBottom: '0.25rem',
                    letterSpacing: '2px',
                  }}
                >
                  {renderStars(entry.rating)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                  {entry.rating.toFixed(1)}/5
                </div>
              </div>
            </div>

            {entry.notes && (
              <p
                style={{
                  margin: 0,
                  color: '#34495e',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  borderLeft: '3px solid #3498db',
                  paddingLeft: '1rem',
                }}
              >
                {entry.notes}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.5rem',
                borderTop: '1px solid #ecf0f1',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#7f8c8d' }}>
                <span>📅 {formatDate(entry.drankAt)}</span>
                {entry.location && <span>📍 {entry.location}</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  to={`/entry/${entry.id}`}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ecf0f1',
                    color: '#2c3e50',
                    borderRadius: 4,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(entry.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
