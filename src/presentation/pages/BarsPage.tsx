import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listBarsUseCase, deleteBarUseCase } from '@di/container';
import type { Bar } from '@domain/entities/Bar';

export function BarsPage() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);

  const loadBars = async () => {
    setLoading(true);
    const data = await listBarsUseCase.execute();
    setBars(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBars();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bar?')) return;
    await deleteBarUseCase.execute(id);
    loadBars();
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
  const filtered = bars.filter((bar) => {
    const matchesText = normalizedQuery
      ? (
          bar.name.toLowerCase().includes(normalizedQuery) ||
          bar.city.toLowerCase().includes(normalizedQuery) ||
          bar.address.toLowerCase().includes(normalizedQuery)
        )
      : true;
    const matchesRating = bar.rating >= minRating && bar.rating <= maxRating;
    return matchesText && matchesRating;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  if (bars.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>No bars added yet</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
          Start tracking your favorite bars and pubs by adding your first one!
        </p>
        <Link
          to="/bars/add"
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
          Add Your First Bar
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>
          Your Bars & Pubs ({filtered.length} {filtered.length === 1 ? 'bar' : 'bars'})
        </h2>
        <Link
          to="/bars/add"
          style={{
            display: 'inline-block',
            backgroundColor: '#3498db',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: 4,
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          + Add Bar
        </Link>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          backgroundColor: 'white',
          padding: '1.5rem',
          marginBottom: '2rem',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search by name, city, or address..."
          style={{
            padding: '0.875rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: 4,
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
              Min Rating: <strong>{minRating}</strong> ⭐
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
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
              Max Rating: <strong>{maxRating}</strong> ⭐
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
          <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: '0.875rem', color: '#95a5a6' }}>
            Showing <strong style={{ margin: '0 0.25rem', color: '#3498db' }}>{filtered.length}</strong> of <strong style={{ margin: '0 0.25rem' }}>{bars.length}</strong> bars
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {filtered.map((bar) => (
          <div
            key={bar.id}
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: 8,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <div>
              <Link
                to={`/bars/${bar.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  {bar.name}
                </h3>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '1.25rem',
                    color: '#f39c12',
                    letterSpacing: '1px',
                  }}
                >
                  {renderStars(bar.rating)}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#7f8c8d', fontWeight: 600 }}>
                  {bar.rating.toFixed(1)}/5
                </span>
              </div>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.875rem', lineHeight: 1.6 }}>
                📍 {bar.address}<br />
                🏙️ {bar.city}
              </p>
            </div>

            {bar.notes && (
              <p
                style={{
                  margin: 0,
                  color: '#34495e',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  borderLeft: '3px solid #3498db',
                  paddingLeft: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  padding: '0.75rem',
                  borderRadius: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {bar.notes}
              </p>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #ecf0f1' }}>
              <div style={{ fontSize: '0.875rem', color: '#7f8c8d', marginBottom: '0.75rem' }}>
                📅 Visited: {formatDate(bar.visitedAt)}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  to={`/bars/${bar.id}`}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#3498db',
                    color: 'white',
                    borderRadius: 4,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    fontWeight: 500,
                  }}
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDelete(bar.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: 500,
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
