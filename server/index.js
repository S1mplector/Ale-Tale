/* Simple Beer Search API proxy using Express.
 * Endpoint: GET /api/beer/search?q=<query>
 * Proxies to Punk API and normalizes results for the UI.
 */
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 5174;

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/beer/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  try {
    // Punk API: https://api.punkapi.com/v2/beers?beer_name=<name>
    const url = `https://api.punkapi.com/v2/beers?beer_name=${encodeURIComponent(q)}&per_page=20`;
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) {
      return res.status(502).json({ error: 'Upstream error', status: r.status });
    }
    const data = await r.json();

    const items = (Array.isArray(data) ? data : []).map((b) => ({
      id: String(b.id ?? ''),
      name: String(b.name ?? ''),
      brewery: 'BrewDog (Punk API)',
      style: String(b.tagline ?? ''),
      abv: typeof b.abv === 'number' ? b.abv : null,
      imageUrl: b.image_url || null,
      origin: 'punkapi',
    }));

    res.json({ items });
  } catch (err) {
    console.error('Beer search failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Beer API server listening on http://localhost:${PORT}`);
});
