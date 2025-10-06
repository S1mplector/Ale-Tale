import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBarUseCase } from '@di/container';

export function AddBarPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    rating: 0,
    atmosphere: '',
    beerSelection: '',
    foodQuality: '',
    service: '',
    priceRange: '',
    amenities: [] as string[],
    favoriteBeers: '',
    notes: '',
    visitedAt: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createBarUseCase.execute({
      name: formData.name,
      address: formData.address,
      city: formData.city,
      rating: formData.rating,
      atmosphere: formData.atmosphere || undefined,
      beerSelection: formData.beerSelection || undefined,
      foodQuality: formData.foodQuality || undefined,
      service: formData.service || undefined,
      priceRange: formData.priceRange || undefined,
      amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
      favoriteBeers: formData.favoriteBeers || undefined,
      notes: formData.notes,
      visitedAt: new Date(formData.visitedAt),
    });

    navigate('/bars');
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const renderStarInput = () => {
    const stars = [];
    for (let i = 0; i <= 5; i += 0.5) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setFormData({ ...formData, rating: i })}
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: formData.rating === i ? '#f39c12' : '#ecf0f1',
            color: formData.rating === i ? 'white' : '#7f8c8d',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: formData.rating === i ? 600 : 400,
          }}
        >
          {i === 0 ? '0' : i}
        </button>
      );
    }
    return stars;
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

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Add Bar or Pub</h2>

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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
              Bar Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., The Craft Beer Corner"
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g., Brooklyn, NY"
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
              Visited Date *
            </label>
            <input
              type="date"
              required
              value={formData.visitedAt}
              onChange={(e) => setFormData({ ...formData, visitedAt: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: 4,
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
            Address *
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g., 123 Main St"
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
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
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
            {renderStars(formData.rating)} {formData.rating.toFixed(1)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {renderStarInput()}
          </div>
        </div>

        <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.125rem' }}>Detailed Review</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
                Atmosphere
              </label>
              <select
                value={formData.atmosphere}
                onChange={(e) => setFormData({ ...formData, atmosphere: e.target.value })}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
                Price Range
              </label>
              <select
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
              Beer Selection
            </label>
            <textarea
              value={formData.beerSelection}
              onChange={(e) => setFormData({ ...formData, beerSelection: e.target.value })}
              placeholder="Describe the beer selection... (e.g., Great craft beer selection with 20 taps, mostly local IPAs and stouts)"
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
              Favorite Beers Tried Here
            </label>
            <input
              type="text"
              value={formData.favoriteBeers}
              onChange={(e) => setFormData({ ...formData, favoriteBeers: e.target.value })}
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
              Food Quality
            </label>
            <textarea
              value={formData.foodQuality}
              onChange={(e) => setFormData({ ...formData, foodQuality: e.target.value })}
              placeholder="How was the food? (e.g., Excellent pub food, great burgers and wings)"
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
              Service Quality
            </label>
            <textarea
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              placeholder="How was the service? (e.g., Friendly and knowledgeable staff)"
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
            <label style={{ display: 'block', marginBottom: '0.75rem', color: '#2c3e50', fontWeight: 500 }}>
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
                    backgroundColor: formData.amenities.includes(amenity) ? '#e3f2fd' : 'white',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
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
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#2c3e50', fontWeight: 500 }}>
            Overall Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any other thoughts about this place? Would you recommend it? Special events or memories?"
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
            style={{
              flex: 1,
              padding: '0.875rem',
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            ✓ Save Bar
          </button>
          <button
            type="button"
            onClick={() => navigate('/bars')}
            style={{
              padding: '0.875rem 1.5rem',
              backgroundColor: '#ecf0f1',
              color: '#2c3e50',
              border: 'none',
              borderRadius: 4,
              fontSize: '1rem',
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
