import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJournalEntryUseCase } from '@di/container';
import type { Beer } from '@domain/entities/Beer';
import { searchBeers } from '@infrastructure/services/BeerSearchService';
import beerPlaceholder from '../images/icons/beer_placeholder.webp';
import { ManualBeerForm } from '@presentation/components/ManualBeerForm';

export function AddEntryPage() {
  const navigate = useNavigate();
  const [selectedBeer, setSelectedBeer] = useState<Beer | null>(null);
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [drankAt, setDrankAt] = useState(new Date().toISOString().split('T')[0]);
  const [ibu, setIbu] = useState('');
  const [appearance, setAppearance] = useState('');
  const [aroma, setAroma] = useState('');
  const [taste, setTaste] = useState('');
  const [mouthfeel, setMouthfeel] = useState('');
  const [servingType, setServingType] = useState('');
  const [glassware, setGlassware] = useState('');
  const [pairingFood, setPairingFood] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'manual' | 'details'>('select');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Beer[]>([]);

  // image cache for results
  const [thumbs, setThumbs] = useState<Record<string, string | null>>({});

  // Debounced async search using our API (Untappd scraper with fallback)
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const items = await searchBeers(query.trim());
        setResults(items);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // fetch thumbnails for visible results (only if not already present)
  React.useEffect(() => {
    const abort = new AbortController();
    async function run() {
      const updates: Record<string, string | null> = {};
      await Promise.all(
        results.map(async (b) => {
          if (b.id in thumbs) return;
          if ((b as any).imageUrl) {
            updates[b.id] = (b as any).imageUrl || null;
            return;
          }
          try {
            const params = new URLSearchParams({
              name: b.name,
              brewery: b.brewery || '',
              id: (b as any).origin === 'wikidata' ? (b.id || '') : '',
            });
            const res = await fetch(`/api/beer/image?${params.toString()}`, { signal: abort.signal });
            if (res.ok) {
              const data = await res.json();
              updates[b.id] = data?.imageUrl || null;
            }
          } catch {}
        })
      );
      if (Object.keys(updates).length) setThumbs((prev) => ({ ...prev, ...updates }));
    }
    if (results.length) run();
    return () => abort.abort();
  }, [results]);

  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeer) return;

    setLoading(true);
    try {
      await createJournalEntryUseCase.execute({
        beerId: selectedBeer.id,
        beerName: selectedBeer.name,
        brewery: selectedBeer.brewery,
        style: selectedBeer.style,
        abv: selectedBeer.abv,
        ibu: ibu ? parseInt(ibu) : undefined,
        rating,
        appearance: appearance || undefined,
        aroma: aroma || undefined,
        taste: taste || undefined,
        mouthfeel: mouthfeel || undefined,
        notes,
        location: location || undefined,
        servingType: servingType || undefined,
        glassware: glassware || undefined,
        pairingFood: pairingFood || undefined,
        imageUrl: imageUrl || undefined,
        drankAt: new Date(drankAt),
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to create entry:', error);
      alert('Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Add Journal Entry</h2>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', alignItems: 'center' }}>
        <span style={{ padding: '4px 8px', borderRadius: 999, background: step === 'select' ? '#3498db' : '#ecf0f1', color: step === 'select' ? 'white' : '#2c3e50' }}>1. Select Beer</span>
        <span style={{ height: 1, background: '#ccc', flex: 1 }} />
        <span style={{ padding: '4px 8px', borderRadius: 999, background: step === 'details' ? '#3498db' : '#ecf0f1', color: step === 'details' ? 'white' : '#2c3e50' }}>2. Details</span>
      </div>

      {/* Step 1: async search */}
      {step === 'select' && (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: 1200, width: '100%', marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Search a beer</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search Untappd..."
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }}
            autoFocus
          />
          <div style={{ marginTop: '0.75rem', maxHeight: 260, overflow: 'auto', border: results.length ? '1px solid #eee' : 'none', borderRadius: 6 }}>
            {searching && <div style={{ padding: '0.75rem', color: '#7f8c8d' }}>Searching…</div>}
            {!searching && query && results.length === 0 && <div style={{ padding: '0.75rem', color: '#7f8c8d' }}>No results</div>}
            {results.map((beer) => (
              <button
                key={beer.id}
                type="button"
                onClick={() => {
                  setSelectedBeer(beer);
                  setStep('details');
                }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'white', border: 'none', borderTop: '1px solid #f2f2f2', cursor: 'pointer' }}
              >
                <img
                  src={(thumbs[beer.id] as string) || beerPlaceholder}
                  alt=""
                  width={32}
                  height={32}
                  style={{ objectFit: 'cover', borderRadius: 4, background: '#f0f0f0' }}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const original = String(thumbs[beer.id] || '');
                    const isProxy = img.src.includes('/api/beer/image/proxy');
                    if (original && !isProxy) {
                      img.src = `/api/beer/image/proxy?url=${encodeURIComponent(original)}`;
                    } else if (img.src !== beerPlaceholder) {
                      img.src = beerPlaceholder;
                    }
                  }}
                />
                <span style={{ flex: 1 }}>
                  <strong>{beer.name}</strong>
                  <span style={{ color: '#7f8c8d' }}> — {beer.brewery}</span>
                </span>
                <span style={{ color: '#7f8c8d', fontSize: 12 }}>{beer.style}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="button"
              disabled={!selectedBeer}
              onClick={() => selectedBeer && setStep('details')}
              style={{ backgroundColor: '#3498db', color: 'white', padding: '0.6rem 1rem', border: 'none', borderRadius: 4, cursor: !selectedBeer ? 'not-allowed' : 'pointer', opacity: !selectedBeer ? 0.6 : 1 }}
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => setStep('manual')}
              style={{ padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: 4, background: 'white' }}
            >
              Add manually
            </button>
            <button type="button" onClick={() => navigate('/')} style={{ padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: 4, background: 'white' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step: Manual add beer */}
      {step === 'manual' && (
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: 1200, width: '100%', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, marginBottom: '1rem', color: '#2c3e50' }}>Add Beer Details</h3>
          <ManualBeerForm
            onCancel={() => setStep('select')}
            onUse={(beer: Beer) => {
              setSelectedBeer(beer);
              setStep('details');
            }}
          />
        </div>
      )}

      {/* Step 2: details */}
      {step === 'details' && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: 1200, width: '100%' }}>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: 6 }}>
            <div style={{ fontSize: '0.875rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>Selected Beer:</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#2c3e50' }}>
              {selectedBeer?.name}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
              {selectedBeer?.brewery} • {selectedBeer?.style} • {selectedBeer?.abv}% ABV
            </div>
            <button type="button" onClick={() => setStep('select')} style={{ marginTop: '0.5rem', border: 'none', background: 'transparent', color: '#3498db', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}>
              Change Beer
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>Rating * ({rating}/5)</label>
              <input type="range" min="0" max="5" step="0.5" value={rating} onChange={(e) => setRating(parseFloat(e.target.value))} style={{ width: '100%' }} />
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>Date *</label>
              <input
                type="date"
                value={drankAt}
                onChange={(e) => setDrankAt(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>IBU (Bitterness)</label>
              <input
                type="number"
                min="0"
                max="120"
                value={ibu}
                onChange={(e) => setIbu(e.target.value)}
                placeholder="e.g., 45"
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>Serving Type</label>
              <select
                value={servingType}
                onChange={(e) => setServingType(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }}
              >
                <option value="">Select...</option>
                <option value="Draft">Draft</option>
                <option value="Bottle">Bottle</option>
                <option value="Can">Can</option>
                <option value="Growler">Growler</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>Glassware</label>
              <select
                value={glassware}
                onChange={(e) => setGlassware(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where did you drink it?"
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>Appearance</label>
              <textarea
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder="Describe color, clarity, head retention... (e.g., Golden amber with a thick white head)"
                rows={2}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>Aroma</label>
              <textarea
                value={aroma}
                onChange={(e) => setAroma(e.target.value)}
                placeholder="Describe the smell... (e.g., Citrus and pine, with hints of tropical fruit)"
                rows={2}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>Taste</label>
              <textarea
                value={taste}
                onChange={(e) => setTaste(e.target.value)}
                placeholder="Describe the flavor profile... (e.g., Balanced malt sweetness with hoppy bitterness)"
                rows={3}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>Mouthfeel</label>
              <textarea
                value={mouthfeel}
                onChange={(e) => setMouthfeel(e.target.value)}
                placeholder="Describe body, carbonation, texture... (e.g., Medium-bodied with moderate carbonation)"
                rows={2}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>Food Pairing</label>
              <input
                type="text"
                value={pairingFood}
                onChange={(e) => setPairingFood(e.target.value)}
                placeholder="What food did you pair it with?"
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>Overall Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any other thoughts or memories about this beer?"
                rows={4}
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4, fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #ecf0f1' }}>
            <button
              type="submit"
              disabled={loading || !selectedBeer}
              style={{ flex: 1, backgroundColor: '#27ae60', color: 'white', padding: '0.875rem', border: 'none', borderRadius: 4, fontSize: '1rem', fontWeight: 500, cursor: loading || !selectedBeer ? 'not-allowed' : 'pointer', opacity: loading || !selectedBeer ? 0.6 : 1 }}
            >
              {loading ? 'Saving...' : '✓ Save Entry'}
            </button>
            <button type="button" onClick={() => navigate('/')} style={{ padding: '0.875rem 1.5rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem', backgroundColor: 'white', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
