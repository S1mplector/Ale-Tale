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
  const [ibu, setIbu] = useState('');
  const [appearance, setAppearance] = useState('');
  const [aroma, setAroma] = useState('');
  const [taste, setTaste] = useState('');
  const [mouthfeel, setMouthfeel] = useState('');
  const [servingType, setServingType] = useState('');
  const [glassware, setGlassware] = useState('');
  const [pairingFood, setPairingFood] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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
        setIbu(e.ibu ? String(e.ibu) : '');
        setAppearance(e.appearance ?? '');
        setAroma(e.aroma ?? '');
        setTaste(e.taste ?? '');
        setMouthfeel(e.mouthfeel ?? '');
        setServingType(e.servingType ?? '');
        setGlassware(e.glassware ?? '');
        setPairingFood(e.pairingFood ?? '');
        setImageUrl(e.imageUrl ?? '');
      }
      setLoading(false);
    });
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
        ibu: ibu ? parseInt(ibu) : undefined,
        appearance: appearance || undefined,
        aroma: aroma || undefined,
        taste: taste || undefined,
        mouthfeel: mouthfeel || undefined,
        servingType: servingType || undefined,
        glassware: glassware || undefined,
        pairingFood: pairingFood || undefined,
        imageUrl: imageUrl || undefined,
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
          maxWidth: 800,
        }}
      >
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: 6 }}>
          <div style={{ fontSize: '0.875rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>Editing:</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#2c3e50' }}>
            {entry.beerName}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
            {entry.brewery} • {entry.style} • {entry.abv}% ABV
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#95a5a6' }}>
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
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

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              IBU (Bitterness)
            </label>
            <input
              type="number"
              min="0"
              max="120"
              value={ibu}
              onChange={(e) => setIbu(e.target.value)}
              placeholder="e.g., 45"
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
              Serving Type
            </label>
            <select
              value={servingType}
              onChange={(e) => setServingType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: 4,
              }}
            >
              <option value="">Select...</option>
              <option value="Draft">Draft</option>
              <option value="Bottle">Bottle</option>
              <option value="Can">Can</option>
              <option value="Growler">Growler</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Glassware
            </label>
            <select
              value={glassware}
              onChange={(e) => setGlassware(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: 4,
              }}
            >
              <option value="">Select...</option>
              <option value="Pint Glass">Pint Glass</option>
              <option value="Tulip">Tulip</option>
              <option value="Snifter">Snifter</option>
              <option value="Weizen Glass">Weizen Glass</option>
              <option value="Pilsner Glass">Pilsner Glass</option>
              <option value="Mug">Mug</option>
              <option value="Chalice">Chalice</option>
              <option value="Can/Bottle">Can/Bottle</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
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
        </div>

        <div style={{ marginTop: '1.5rem', borderTop: '2px solid #ecf0f1', paddingTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.125rem' }}>Beer Photo</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Upload Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: 4,
                boxSizing: 'border-box',
              }}
            />
            {imageUrl && (
              <div style={{ marginTop: '1rem' }}>
                <img
                  src={imageUrl}
                  alt="Beer preview"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '300px',
                    borderRadius: 8,
                    objectFit: 'cover',
                    border: '2px solid #ecf0f1',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{
                    display: 'block',
                    marginTop: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', borderTop: '2px solid #ecf0f1', paddingTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.125rem' }}>Detailed Tasting Notes</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Appearance
            </label>
            <textarea
              value={appearance}
              onChange={(e) => setAppearance(e.target.value)}
              placeholder="Describe color, clarity, head retention..."
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Aroma
            </label>
            <textarea
              value={aroma}
              onChange={(e) => setAroma(e.target.value)}
              placeholder="Describe the smell..."
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Taste
            </label>
            <textarea
              value={taste}
              onChange={(e) => setTaste(e.target.value)}
              placeholder="Describe the flavor profile..."
              rows={3}
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Mouthfeel
            </label>
            <textarea
              value={mouthfeel}
              onChange={(e) => setMouthfeel(e.target.value)}
              placeholder="Describe body, carbonation, texture..."
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Food Pairing
            </label>
            <input
              type="text"
              value={pairingFood}
              onChange={(e) => setPairingFood(e.target.value)}
              placeholder="What food did you pair it with?"
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
              Overall Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other thoughts or memories?"
              rows={4}
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
