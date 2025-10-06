import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getBarUseCase, updateBarUseCase } from '@di/container';
import type { Bar } from '@domain/entities/Bar';

export function EditBarPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bar, setBar] = useState<Bar | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [visitedAt, setVisitedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getBarUseCase.execute(id).then((b) => {
      setBar(b);
      if (b) {
        setName(b.name);
        setAddress(b.address);
        setCity(b.city);
        setRating(b.rating);
        setNotes(b.notes ?? '');
        setVisitedAt(new Date(b.visitedAt).toISOString().split('T')[0]);
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!bar || !id) return;
    setSaving(true);
    try {
      await updateBarUseCase.execute(id, {
        name,
        address,
        city,
        rating,
        notes,
        visitedAt: new Date(visitedAt),
      });
      navigate(`/bars/${id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to update bar');
    } finally {
      setSaving(false);
    }
  };

  const renderStarInput = () => {
    const stars = [];
    for (let i = 0; i <= 5; i += 0.5) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: rating === i ? '#f39c12' : '#ecf0f1',
            color: rating === i ? 'white' : '#7f8c8d',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: rating === i ? 600 : 400,
          }}
        >
          {i === 0 ? '0' : i}
        </button>
      );
    }
    return stars;
  };

  const renderStars = (r: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (r >= i) {
        stars.push('★');
      } else if (r >= i - 0.5) {
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
        <Link to="/bars" style={{ color: '#3498db', textDecoration: 'none' }}>Back to Bars</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/bars/${bar.id}`} style={{ color: '#3498db', textDecoration: 'none' }}>
          ← Back to Bar
        </Link>
      </div>
      <h2 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Edit Bar</h2>
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
            Bar Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            Address *
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
            City *
          </label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
            Rating *
          </label>
          <div
            style={{
              fontSize: '2rem',
              color: '#f39c12',
              marginBottom: '0.75rem',
              letterSpacing: '4px',
            }}
          >
            {renderStars(rating)} {rating.toFixed(1)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {renderStarInput()}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
            Visited Date *
          </label>
          <input
            type="date"
            value={visitedAt}
            onChange={(e) => setVisitedAt(e.target.value)}
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
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you think about this place?"
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
