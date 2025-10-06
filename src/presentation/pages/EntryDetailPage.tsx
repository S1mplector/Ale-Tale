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
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
          padding: '2.5rem',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #ecf0f1' }}>
          <h1 style={{ margin: 0, marginBottom: '0.75rem', color: '#2c3e50', fontSize: '2.5rem' }}>
            {entry.beerName}
          </h1>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '1.25rem', marginBottom: '1rem' }}>
            🍺 {entry.brewery} • 🏷️ {entry.style}
          </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '1rem', color: '#7f8c8d' }}>
            <span><strong>ABV:</strong> {entry.abv}%</span>
            {entry.ibu && <span><strong>IBU:</strong> {entry.ibu}</span>}
            {entry.servingType && <span><strong>Serving:</strong> {entry.servingType}</span>}
            {entry.glassware && <span><strong>Glass:</strong> {entry.glassware}</span>}
          </div>
        </div>

        {entry.imageUrl && (
          <div style={{ marginBottom: '2rem' }}>
            <img
              src={entry.imageUrl}
              alt={entry.beerName}
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: 8,
                objectFit: 'contain',
                border: '2px solid #ecf0f1',
              }}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: '0.75rem', color: '#2c3e50', fontSize: '1.125rem' }}>
              Overall Rating
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
            <h3 style={{ margin: 0, marginBottom: '0.75rem', color: '#2c3e50', fontSize: '1.125rem' }}>
              When & Where
            </h3>
            <p style={{ margin: 0, color: '#34495e', fontSize: '1rem', lineHeight: 1.8 }}>
              📅 {formatDate(entry.drankAt)}
              {entry.location && <><br />📍 {entry.location}</>}
              {entry.pairingFood && <><br />🍴 Paired with: {entry.pairingFood}</>}
            </p>
          </div>
        </div>

        {(entry.appearance || entry.aroma || entry.taste || entry.mouthfeel) && (
          <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50', fontSize: '1.25rem' }}>Detailed Tasting Notes</h3>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {entry.appearance && (
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#34495e', fontSize: '1rem', fontWeight: 600 }}>
                    👁️ Appearance
                  </h4>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.9375rem', lineHeight: 1.7, backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: 4 }}>
                    {entry.appearance}
                  </p>
                </div>
              )}

              {entry.aroma && (
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#34495e', fontSize: '1rem', fontWeight: 600 }}>
                    👃 Aroma
                  </h4>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.9375rem', lineHeight: 1.7, backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: 4 }}>
                    {entry.aroma}
                  </p>
                </div>
              )}

              {entry.taste && (
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#34495e', fontSize: '1rem', fontWeight: 600 }}>
                    👅 Taste
                  </h4>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.9375rem', lineHeight: 1.7, backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: 4 }}>
                    {entry.taste}
                  </p>
                </div>
              )}

              {entry.mouthfeel && (
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#34495e', fontSize: '1rem', fontWeight: 600 }}>
                    🥃 Mouthfeel
                  </h4>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.9375rem', lineHeight: 1.7, backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: 4 }}>
                    {entry.mouthfeel}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {entry.notes && (
          <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, marginBottom: '0.75rem', color: '#2c3e50', fontSize: '1.125rem' }}>
              Overall Notes
            </h3>
            <p
              style={{
                margin: 0,
                color: '#34495e',
                fontSize: '1rem',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f8f9fa',
                padding: '1.25rem',
                borderRadius: 4,
                border: '1px solid #e9ecef',
              }}
            >
              {entry.notes}
            </p>
          </div>
        )}

        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid #ecf0f1',
            fontSize: '0.875rem',
            color: '#95a5a6',
            marginBottom: '2rem',
          }}
        >
          Entry created on {formatDate(entry.createdAt)}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to={`/entry/${entry.id}/edit`}
            style={{
              padding: '0.875rem 1.75rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: '1rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            ✏️ Edit Entry
          </Link>
          <button
            onClick={handleDelete}
            style={{
              padding: '0.875rem 1.75rem',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            🗑️ Delete Entry
          </button>
        </div>
      </div>
    </div>
  );
}
