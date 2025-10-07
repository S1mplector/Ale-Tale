import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listJournalEntriesUseCase, listBarsUseCase } from '@di/container';
import type { JournalEntry } from '@domain/entities/JournalEntry';
import type { Bar } from '@domain/entities/Bar';

type SearchResult = {
  type: 'beer' | 'bar';
  id: string;
  title: string;
  subtitle: string;
  details: string;
  rating?: number;
  link: string;
};

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<'all' | 'beers' | 'bars'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entriesData, barsData] = await Promise.all([
        listJournalEntriesUseCase.execute(),
        listBarsUseCase.execute(),
      ]);
      setEntries(entriesData);
      setBars(barsData);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push('★');
      else if (rating >= i - 0.5) stars.push('½');
      else stars.push('☆');
    }
    return stars.join('');
  };

  const searchResults = (): SearchResult[] => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    if (searchType === 'all' || searchType === 'beers') {
      // Search beer entries
      entries.forEach((entry) => {
        const matches =
          entry.beerName.toLowerCase().includes(q) ||
          entry.brewery.toLowerCase().includes(q) ||
          entry.style.toLowerCase().includes(q) ||
          entry.notes?.toLowerCase().includes(q) ||
          entry.location?.toLowerCase().includes(q) ||
          entry.appearance?.toLowerCase().includes(q) ||
          entry.aroma?.toLowerCase().includes(q) ||
          entry.taste?.toLowerCase().includes(q);

        if (matches) {
          results.push({
            type: 'beer',
            id: entry.id,
            title: entry.beerName,
            subtitle: `${entry.brewery} • ${entry.style}`,
            details: new Date(entry.drankAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            rating: entry.rating,
            link: `/entry/${entry.id}`,
          });
        }
      });
    }

    if (searchType === 'all' || searchType === 'bars') {
      // Search bars
      bars.forEach((bar) => {
        const matches =
          bar.name.toLowerCase().includes(q) ||
          bar.address.toLowerCase().includes(q) ||
          bar.city.toLowerCase().includes(q) ||
          bar.notes?.toLowerCase().includes(q) ||
          bar.atmosphere?.toLowerCase().includes(q) ||
          bar.beerSelection?.toLowerCase().includes(q);

        if (matches) {
          results.push({
            type: 'bar',
            id: bar.id,
            title: bar.name,
            subtitle: `${bar.address}, ${bar.city}`,
            details: new Date(bar.visitedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            rating: bar.rating,
            link: `/bars/${bar.id}`,
          });
        }
      });
    }

    return results;
  };

  const results = searchResults();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <p style={{ color: '#7f8c8d' }}>Loading search index...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Search</h2>

      {/* Search Bar */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search beers, bars, breweries, locations, notes..."
            autoFocus
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1.125rem',
              border: '2px solid #ddd',
              borderRadius: 8,
              boxSizing: 'border-box',
              outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#3498db'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setSearchType('all')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: searchType === 'all' ? '#3498db' : '#f8f9fa',
              color: searchType === 'all' ? 'white' : '#2c3e50',
              border: 'none',
              borderRadius: 4,
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            All ({entries.length + bars.length})
          </button>
          <button
            onClick={() => setSearchType('beers')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: searchType === 'beers' ? '#3498db' : '#f8f9fa',
              color: searchType === 'beers' ? 'white' : '#2c3e50',
              border: 'none',
              borderRadius: 4,
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            🍺 Beers ({entries.length})
          </button>
          <button
            onClick={() => setSearchType('bars')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: searchType === 'bars' ? '#3498db' : '#f8f9fa',
              color: searchType === 'bars' ? 'white' : '#2c3e50',
              border: 'none',
              borderRadius: 4,
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            🏪 Bars ({bars.length})
          </button>
        </div>
      </div>

      {/* Search Results */}
      {!query.trim() ? (
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Start Searching</h3>
          <p style={{ color: '#7f8c8d', fontSize: '0.9375rem' }}>
            Enter a search term to find beers, bars, locations, and notes
          </p>
        </div>
      ) : results.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>No Results Found</h3>
          <p style={{ color: '#7f8c8d', fontSize: '0.9375rem' }}>
            Try different keywords or check your spelling
          </p>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1rem', color: '#7f8c8d', fontSize: '0.875rem' }}>
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </div>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {results.map((result) => (
              <Link
                key={result.id}
                to={result.link}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: 8,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{result.type === 'beer' ? '🍺' : '🏪'}</span>
                    <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.125rem' }}>{result.title}</h3>
                  </div>
                  <p style={{ margin: '0 0 0.25rem 0', color: '#7f8c8d', fontSize: '0.9375rem' }}>
                    {result.subtitle}
                  </p>
                  <p style={{ margin: 0, color: '#95a5a6', fontSize: '0.8125rem' }}>
                    {result.details}
                  </p>
                </div>
                {result.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
                    <span style={{ fontSize: '1.25rem', color: '#f39c12', letterSpacing: '2px' }}>
                      {renderStars(result.rating)}
                    </span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#2c3e50' }}>
                      {result.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
