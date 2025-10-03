import { Router } from 'express';
import { searchPunk } from '../sources/punk.js';
import { searchWikidata } from '../sources/wikidata.js';

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
