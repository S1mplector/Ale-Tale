import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listJournalEntriesUseCase, listBarsUseCase } from '@di/container';
import type { JournalEntry } from '@domain/entities/JournalEntry';

export function StatisticsPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await listJournalEntriesUseCase.execute();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        <p style={{ color: '#7f8c8d' }}>Calculating statistics...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div>
        <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Statistics & Insights</h2>
        <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>No Data Yet</h3>
          <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>Add some journal entries to see your statistics!</p>
          <Link to="/add" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3498db', color: 'white', borderRadius: 4, textDecoration: 'none', fontWeight: 500 }}>
            Add Your First Entry
          </Link>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalEntries = entries.length;
  const uniqueBeers = new Set(entries.map(e => e.beerId)).size;
  const avgRating = entries.reduce((sum, e) => sum + e.rating, 0) / entries.length;
  
  // Top rated beers
  const beerRatings = new Map<string, { name: string; brewery: string; rating: number; count: number }>();
  entries.forEach(e => {
    const existing = beerRatings.get(e.beerId);
    if (existing) {
      existing.rating = (existing.rating * existing.count + e.rating) / (existing.count + 1);
      existing.count++;
    } else {
      beerRatings.set(e.beerId, { name: e.beerName, brewery: e.brewery, rating: e.rating, count: 1 });
    }
  });
  const topRatedBeers = Array.from(beerRatings.values())
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  // Favorite styles
  const styleCounts = new Map<string, number>();
  entries.forEach(e => {
    styleCounts.set(e.style, (styleCounts.get(e.style) || 0) + 1);
  });
  const topStyles = Array.from(styleCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top breweries
  const breweryCounts = new Map<string, number>();
  entries.forEach(e => {
    breweryCounts.set(e.brewery, (breweryCounts.get(e.brewery) || 0) + 1);
  });
  const topBreweries = Array.from(breweryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Recent activity
  const sortedByDate = [...entries].sort((a, b) => new Date(b.drankAt).getTime() - new Date(a.drankAt).getTime());
  const recentEntries = sortedByDate.slice(0, 5);

  // Monthly breakdown
  const monthlyData = new Map<string, number>();
  entries.forEach(e => {
    const month = new Date(e.drankAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
  });
  const monthlyBreakdown = Array.from(monthlyData.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-6);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push('★');
      else if (rating >= i - 0.5) stars.push('½');
      else stars.push('☆');
    }
    return stars.join('');
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Statistics & Insights</h2>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#3498db', marginBottom: '0.5rem' }}>{totalEntries}</div>
          <div style={{ fontSize: '0.875rem', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Entries</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#9b59b6', marginBottom: '0.5rem' }}>{uniqueBeers}</div>
          <div style={{ fontSize: '0.875rem', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unique Beers</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#f39c12', marginBottom: '0.5rem' }}>{avgRating.toFixed(1)}</div>
          <div style={{ fontSize: '0.875rem', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Rating</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#27ae60', marginBottom: '0.5rem' }}>{topStyles.length}</div>
          <div style={{ fontSize: '0.875rem', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Styles Tried</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        {/* Top Rated Beers */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⭐ Top Rated Beers
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {topRatedBeers.map((beer, idx) => (
              <div key={idx} style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.9375rem' }}>{beer.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#7f8c8d' }}>{beer.brewery}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', color: '#f39c12' }}>{renderStars(beer.rating)}</span>
                  <span style={{ fontWeight: 600, color: '#2c3e50' }}>{beer.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Styles */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏆 Favorite Styles
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {topStyles.map(([style, count], idx) => (
              <div key={idx} style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.9375rem' }}>{style}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 120, height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(count / totalEntries) * 100}%`, height: '100%', backgroundColor: '#3498db' }} />
                  </div>
                  <span style={{ fontWeight: 600, color: '#2c3e50', minWidth: 30 }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Breweries */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏭 Most Tried Breweries
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {topBreweries.map(([brewery, count], idx) => (
              <div key={idx} style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.9375rem' }}>{brewery}</div>
                <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '1.125rem' }}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Activity */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📈 Recent Activity
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {monthlyBreakdown.map(([month, count], idx) => (
              <div key={idx} style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.9375rem' }}>{month}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 100, height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(count / Math.max(...Array.from(monthlyData.values()))) * 100}%`, height: '100%', backgroundColor: '#27ae60' }} />
                  </div>
                  <span style={{ fontWeight: 600, color: '#2c3e50', minWidth: 20 }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div style={{ marginTop: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🕒 Recent Entries
        </h3>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {recentEntries.map((entry) => (
            <Link
              key={entry.id}
              to={`/entry/${entry.id}`}
              style={{
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: 4,
                textDecoration: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ecf0f1'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{entry.beerName}</div>
                <div style={{ fontSize: '0.8125rem', color: '#7f8c8d' }}>{entry.brewery} • {entry.style}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                  {new Date(entry.drankAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '1rem', color: '#f39c12' }}>{renderStars(entry.rating)}</span>
                  <span style={{ fontWeight: 600, color: '#2c3e50' }}>{entry.rating.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
