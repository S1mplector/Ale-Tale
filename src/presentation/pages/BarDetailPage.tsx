import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBarUseCase, deleteBarUseCase } from '@di/container';
import type { Bar } from '@domain/entities/Bar';

export function BarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bar, setBar] = useState<Bar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getBarUseCase.execute(id).then((data) => {
      setBar(data);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Delete this bar?')) return;
    await deleteBarUseCase.execute(id);
    navigate('/bars');
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

  if (!bar) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Bar not found</h2>
        <Link
          to="/bars"
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
          Back to Bars
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/bars"
          style={{
            color: '#3498db',
            textDecoration: 'none',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          ← Back to Bars
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
            {bar.name}
          </h1>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '1.125rem', marginBottom: '0.75rem' }}>
            📍 {bar.address}, {bar.city}
          </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '1rem', color: '#7f8c8d' }}>
            {bar.atmosphere && <span><strong>Atmosphere:</strong> {bar.atmosphere}</span>}
            {bar.priceRange && <span><strong>Price Range:</strong> {bar.priceRange}</span>}
          </div>
        </div>

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
                {renderStars(bar.rating)}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#2c3e50' }}>
                {bar.rating.toFixed(1)}/5
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ margin: 0, marginBottom: '0.75rem', color: '#2c3e50', fontSize: '1.125rem' }}>
              Visited Date
            </h3>
            <p style={{ margin: 0, color: '#34495e', fontSize: '1rem' }}>
              📅 {formatDate(bar.visitedAt)}
            </p>
          </div>
        </div>

        {(bar.beerSelection || bar.favoriteBeers || bar.foodQuality || bar.service) && (
          <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#2c3e50', fontSize: '1.25rem' }}>Detailed Review</h3>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {bar.beerSelection && (
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#34495e', fontSize: '1rem', fontWeight: 600 }}>
                    🍺 Beer Selection
                  </h4>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.9375rem', lineHeight: 1.7, backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: 4 }}>
                    {bar.beerSelection}
                  </p>
                </div>
              )}

              {bar.favoriteBeers && (
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#34495e', fontSize: '1rem', fontWeight: 600 }}>
                    ⭐ Favorite Beers Tried Here
                  </h4>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.9375rem', lineHeight: 1.7, backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: 4 }}>
                    {bar.favoriteBeers}
                  </p>
                </div>
              )}

              {bar.foodQuality && (
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#34495e', fontSize: '1rem', fontWeight: 600 }}>
                    🍔 Food Quality
                  </h4>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.9375rem', lineHeight: 1.7, backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: 4 }}>
                    {bar.foodQuality}
                  </p>
                </div>
              )}

              {bar.service && (
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#34495e', fontSize: '1rem', fontWeight: 600 }}>
                    👥 Service
                  </h4>
                  <p style={{ margin: 0, color: '#555', fontSize: '0.9375rem', lineHeight: 1.7, backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: 4 }}>
                    {bar.service}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {bar.amenities && bar.amenities.length > 0 && (
          <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.125rem' }}>
              Amenities
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {bar.amenities.map((amenity) => (
                <span
                  key={amenity}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    borderRadius: 20,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {bar.notes && (
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
              {bar.notes}
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
          Entry created on {formatDate(bar.createdAt)}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to={`/bars/${bar.id}/edit`}
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
            ✏️ Edit Bar
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
            🗑️ Delete Bar
          </button>
        </div>
      </div>
    </div>
  );
}
