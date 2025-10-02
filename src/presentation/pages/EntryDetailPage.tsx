import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJournalEntryUseCase, deleteJournalEntryUseCase } from '@di/container';
import type { JournalEntry } from '@domain/entities/JournalEntry';

export function EntryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getJournalEntryUseCase.execute(id).then((data) => {
      setEntry(data);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Delete this entry?')) return;
    await deleteJournalEntryUseCase.execute(id);
    navigate('/');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  if (!entry) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Entry not found</h2>
        <Link
          to="/"
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
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/"
          style={{
            color: '#3498db',
            textDecoration: 'none',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          ← Back to Journal
        </Link>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #ecf0f1' }}>
          <h1 style={{ margin: 0, marginBottom: '0.5rem', color: '#2c3e50', fontSize: '2rem' }}>
            {entry.beerName}
          </h1>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '1.125rem' }}>
            {entry.brewery} • {entry.style} • {entry.abv}% ABV
          </p>
        </div>

        <div style={{ display: 'grid', gap: '2rem' }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: '0.75rem', color: '#2c3e50', fontSize: '1rem' }}>
              Rating
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span
                style={{
                  fontSize: '2rem',
                  color: '#f39c12',
                  letterSpacing: '4px',
                }}
              >
                {renderStars(entry.rating)}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2c3e50' }}>
                {entry.rating.toFixed(1)}/5
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ margin: 0, marginBottom: '0.75rem', color: '#2c3e50', fontSize: '1rem' }}>
              Date
            </h3>
            <p style={{ margin: 0, color: '#34495e', fontSize: '1.125rem' }}>
              📅 {formatDate(entry.drankAt)}
            </p>
          </div>

          {entry.location && (
            <div>
              <h3 style={{ margin: 0, marginBottom: '0.75rem', color: '#2c3e50', fontSize: '1rem' }}>
                Location
              </h3>
              <p style={{ margin: 0, color: '#34495e', fontSize: '1.125rem' }}>
                📍 {entry.location}
              </p>
            </div>
          )}

          {entry.notes && (
            <div>
              <h3 style={{ margin: 0, marginBottom: '0.75rem', color: '#2c3e50', fontSize: '1rem' }}>
                Tasting Notes
              </h3>
              <p
                style={{
                  margin: 0,
                  color: '#34495e',
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: 4,
                }}
              >
                {entry.notes}
              </p>
            </div>
          )}

          <div
            style={{
              marginTop: '1rem',
              paddingTop: '2rem',
              borderTop: '1px solid #ecf0f1',
              fontSize: '0.875rem',
              color: '#95a5a6',
            }}
          >
            Added on {formatDate(entry.createdAt)}
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <Link
            to={`/entry/${entry.id}/edit`}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: '1rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Edit Entry
          </Link>
          <button
            onClick={handleDelete}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Delete Entry
          </button>
        </div>
      </div>
    </div>
  );
}
