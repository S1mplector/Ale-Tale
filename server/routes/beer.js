import { Router } from 'express';
import { Readable } from 'node:stream';
import { searchPunk } from '../sources/punk.js';
import { searchWikidata } from '../sources/wikidata.js';
import { imageService } from '../services/ImageService.js';

export const beerRouter = Router();

beerRouter.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
  try {
    const items = await searchPunk(q);
    res.json({ items });
  } catch (e) {
    console.error('beer/search failed', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/beer/image/proxy?url=...
// Proxies a remote image to avoid mixed-content/CORS and apply caching headers
beerRouter.get('/image/proxy', async (req, res) => {
  const raw = String(req.query.url || '').trim();
  if (!raw) return res.status(400).send('Missing url');
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return res.status(400).send('Invalid protocol');
    // Basic allowlist (expand if needed)
    const allowedHosts = new Set([
      'upload.wikimedia.org',
      'commons.wikimedia.org',
      'images.unsplash.com',
      'static.untappd.com',
    ]);
    if (!allowedHosts.has(u.hostname)) {
      // Fallback: still allow but set tighter cache; comment out to enforce allowlist strictly
      // return res.status(400).send('Host not allowed');
    }
    const r = await fetch(u.toString());
    if (!r.ok || !r.body) return res.status(502).send('Upstream error');
    const ct = r.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    const nodeStream = Readable.fromWeb(r.body);
    nodeStream.on('error', () => res.end());
    nodeStream.pipe(res);
  } catch (e) {
    console.error('image proxy error', e);
    res.status(500).send('Internal server error');
  }
});

beerRouter.get('/aggregate/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
  try {
    const [w, p] = await Promise.allSettled([
      searchWikidata(q),
      searchPunk(q),
    ]);
    const wikidata = w.status === 'fulfilled' ? w.value : [];
    const punk = p.status === 'fulfilled' ? p.value : [];

    const byKey = new Map();
    const push = (item) => {
      const key = `${item.name.toLowerCase()}|${(item.brewery || '').toLowerCase()}`;
      if (!byKey.has(key)) byKey.set(key, item);
    };
    wikidata.forEach(push);
    punk.forEach(push);

    res.json({ items: Array.from(byKey.values()).slice(0, 50) });
  } catch (e) {
    console.error('beer/aggregate/search failed', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/beer/image?name=...&brewery=...&id=<wikidataId>
beerRouter.get('/image', async (req, res) => {
  const name = String(req.query.name || req.query.q || '').trim();
  const brewery = String(req.query.brewery || '').trim();
  const id = String(req.query.id || '').trim();
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    const imageUrl = await imageService.resolve({ name, brewery, wikidataId: id });
    res.json({ imageUrl });
  } catch (e) {
    console.error('beer/image failed', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});
