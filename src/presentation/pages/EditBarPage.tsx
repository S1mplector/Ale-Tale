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
  const [atmosphere, setAtmosphere] = useState('');
  const [beerSelection, setBeerSelection] = useState('');
  const [foodQuality, setFoodQuality] = useState('');
  const [service, setService] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [favoriteBeers, setFavoriteBeers] = useState('');
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
        setAtmosphere(b.atmosphere ?? '');
        setBeerSelection(b.beerSelection ?? '');
        setFoodQuality(b.foodQuality ?? '');
        setService(b.service ?? '');
        setPriceRange(b.priceRange ?? '');
        setAmenities(b.amenities ?? []);
        setFavoriteBeers(b.favoriteBeers ?? '');
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
        atmosphere: atmosphere || undefined,
        beerSelection: beerSelection || undefined,
        foodQuality: foodQuality || undefined,
        service: service || undefined,
        priceRange: priceRange || undefined,
        amenities: amenities.length > 0 ? amenities : undefined,
        favoriteBeers: favoriteBeers || undefined,
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

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const amenitiesList = [
    'Outdoor Seating',
    'Live Music',
    'Sports TV',
    'WiFi',
    'Food Menu',
    'Happy Hour',
    'Pet Friendly',
    'Parking Available',
  ];

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
          maxWidth: 900,
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.125rem' }}>Basic Information</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
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

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
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

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
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
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
            Overall Rating *
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

        <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.125rem' }}>Detailed Review</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
                Atmosphere
              </label>
              <select
                value={atmosphere}
                onChange={(e) => setAtmosphere(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                }}
              >
                <option value="">Select...</option>
                <option value="Cozy">Cozy</option>
                <option value="Lively">Lively</option>
                <option value="Quiet">Quiet</option>
                <option value="Upscale">Upscale</option>
                <option value="Casual">Casual</option>
                <option value="Dive Bar">Dive Bar</option>
                <option value="Sports Bar">Sports Bar</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                }}
              >
                <option value="">Select...</option>
                <option value="$">$ - Budget Friendly</option>
                <option value="$$">$$ - Moderate</option>
                <option value="$$$">$$$ - Upscale</option>
                <option value="$$$$">$$$$ - Fine Dining</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Beer Selection
            </label>
            <textarea
              value={beerSelection}
              onChange={(e) => setBeerSelection(e.target.value)}
              placeholder="Describe the beer selection..."
              rows={2}
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

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Favorite Beers Tried Here
            </label>
            <input
              type="text"
              value={favoriteBeers}
              onChange={(e) => setFavoriteBeers(e.target.value)}
              placeholder="e.g., Pliny the Elder, Heady Topper"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: 4,
              }}
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Food Quality
            </label>
            <textarea
              value={foodQuality}
              onChange={(e) => setFoodQuality(e.target.value)}
              placeholder="How was the food?"
              rows={2}
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

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Service Quality
            </label>
            <textarea
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="How was the service?"
              rows={2}
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

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500, color: '#2c3e50' }}>
              Amenities
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
              {amenitiesList.map((amenity) => (
                <label
                  key={amenity}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    cursor: 'pointer',
                    backgroundColor: amenities.includes(amenity) ? '#e3f2fd' : 'white',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.875rem' }}>{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
            Overall Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any other thoughts about this place?"
            rows={5}
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

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #ecf0f1' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              backgroundColor: '#27ae60',
              color: 'white',
              padding: '0.875rem',
              border: 'none',
              borderRadius: 4,
              fontSize: '1rem',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : '✓ Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '0.875rem 1.5rem',
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
