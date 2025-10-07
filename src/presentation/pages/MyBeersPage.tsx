import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listJournalEntriesUseCase } from '@di/container';
import type { JournalEntry } from '@domain/entities/JournalEntry';
import { renderStars } from '@presentation/utils/ui';

interface BeerSummary {
  beerId: string;
  name: string;
  brewery: string;
  style: string;
  abv: number;
  timesHad: number;
  avgRating: number;
  firstTried: Date;
  lastTried: Date;
  entries: JournalEntry[];
}

export function MyBeersPage() {
  const [beers, setBeers] = useState<BeerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'times' | 'recent'>('name');
  const [filterStyle, setFilterStyle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBeers();
  }, []);

  const loadBeers = async () => {
    setLoading(true);
    try {
      const entries = await listJournalEntriesUseCase.execute();
      const beerMap = new Map<string, BeerSummary>();

      entries.forEach((entry) => {
        const existing = beerMap.get(entry.beerId);
        if (existing) {
          existing.timesHad++;
          existing.avgRating = (existing.avgRating * (existing.timesHad - 1) + entry.rating) / existing.timesHad;
          existing.lastTried = new Date(entry.drankAt) > new Date(existing.lastTried) ? entry.drankAt : existing.lastTried;
          existing.entries.push(entry);
        } else {
          beerMap.set(entry.beerId, {
            beerId: entry.beerId,
            name: entry.beerName,
            brewery: entry.brewery,
            style: entry.style,
            abv: entry.abv,
            timesHad: 1,
            avgRating: entry.rating,
            firstTried: entry.drankAt,
            lastTried: entry.drankAt,
            entries: [entry],
          });
        }
      });

      setBeers(Array.from(beerMap.values()));
    } finally {
      setLoading(false);
    }
  };

  

  const sortedAndFilteredBeers = beers
    .filter((beer) => {
      if (filterStyle && beer.style !== filterStyle) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          beer.name.toLowerCase().includes(query) ||
          beer.brewery.toLowerCase().includes(query) ||
          beer.style.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.avgRating - a.avgRating;
        case 'times':
          return b.timesHad - a.timesHad;
        case 'recent':
          return new Date(b.lastTried).getTime() - new Date(a.lastTried).getTime();
        default:
          return 0;
      }
    });

  const allStyles = Array.from(new Set(beers.map((b) => b.style))).sort();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍺</div>
        <p style={{ color: '#7f8c8d' }}>Loading your beer collection...</p>
      </div>
    );
  }

  if (beers.length === 0) {
    return (
      <div>
        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>My Beer Database</h2>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍺</div>
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>No Beers Yet</h3>
          <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>Start adding journal entries to build your personal beer database!</p>
          <Link to="/add" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3498db', color: 'white', borderRadius: 4, textDecoration: 'none', fontWeight: 500 }}>
            Add Your First Entry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>My Beer Database</h2>
        <div style={{ color: '#7f8c8d', fontSize: '0.875rem' }}>
          {beers.length} unique beer{beers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#2c3e50' }}>Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, brewery, or style..."
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#2c3e50' }}>Filter by Style</label>
            <select
              value={filterStyle}
              onChange={(e) => setFilterStyle(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }}
            >
              <option value="">All Styles</option>
              {allStyles.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#2c3e50' }}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: 4 }}
            >
              <option value="name">Name (A-Z)</option>
              <option value="rating">Highest Rated</option>
              <option value="times">Most Had</option>
              <option value="recent">Recently Tried</option>
            </select>
          </div>
        </div>
      </div>

      {/* Beer Grid */}
      {sortedAndFilteredBeers.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 8, textAlign: 'center' }}>
          <p style={{ color: '#7f8c8d' }}>No beers match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {sortedAndFilteredBeers.map((beer) => (
            <div
              key={beer.beerId}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: 8,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', color: '#2c3e50', fontSize: '1.25rem' }}>{beer.name}</h3>
                <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9375rem' }}>
                  {beer.brewery} • {beer.style} • {beer.abv}% ABV
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem', color: '#f39c12', letterSpacing: '2px' }}>
                    {renderStars(beer.avgRating)}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2c3e50' }}>
                    {beer.avgRating.toFixed(1)}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #ecf0f1', fontSize: '0.875rem', color: '#7f8c8d' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#2c3e50' }}>{beer.timesHad}</div>
                  <div>Time{beer.timesHad !== 1 ? 's' : ''} Had</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#2c3e50' }}>
                    {new Date(beer.lastTried).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div>Last Tried</div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                {beer.entries.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/entry/${entry.id}`}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #ecf0f1',
                      borderRadius: 4,
                      textAlign: 'center',
                      textDecoration: 'none',
                      fontSize: '0.75rem',
                      color: '#3498db',
                      fontWeight: 500,
                    }}
                  >
                    View Entry
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
