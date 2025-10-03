/* Simple Beer Search API proxy using Express.
 * Endpoint: GET /api/beer/search?q=<query>
 * Proxies to Punk API and normalizes results for the UI. Uses Node's built-in fetch.
 */
import express from 'express';
import { load as loadHtml } from 'cheerio';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beerRouter } from './routes/beer.js';

const app = express();
const PORT = process.env.PORT || 5174;

// Load local beers dataset for reliable results without scraping
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let LOCAL_BEERS = [];
try {
  const p = path.resolve(__dirname, 'data/beers.json');
  if (fs.existsSync(p)) {
    LOCAL_BEERS = JSON.parse(fs.readFileSync(p, 'utf-8'));
  }
} catch (e) {
  console.warn('Failed to load local beers dataset', e);
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Aggregate search: combine Wikidata (macro brands) + Punk API (craft)
// GET /api/beer/aggregate/search?q=...
app.get('/api/beer/aggregate/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  try {
    const wikidataSparql = `
      SELECT ?item ?itemLabel ?producerLabel ?styleLabel ?abv WHERE {
        ?item rdfs:label ?label FILTER(CONTAINS(LCASE(?label), LCASE("${q.replace(/"/g, '\\"')}")) && LANG(?label) = "en").
        ?item wdt:P31/wdt:P279* wd:Q44 .
        OPTIONAL { ?item wdt:P176 ?producer . }
        OPTIONAL { ?item wdt:P279 ?style . }
        OPTIONAL { ?item wdt:P215 ?abv . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 25`;

    const wikidataUrl = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(wikidataSparql)}`;
    const punkUrl = `https://api.punkapi.com/v2/beers?beer_name=${encodeURIComponent(q)}&per_page=25`;

    const [wikidataResp, punkResp] = await Promise.allSettled([
      fetch(wikidataUrl, { headers: { 'Accept': 'application/sparql-results+json', 'User-Agent': 'Brewlog/0.1 (dev)' } }),
      fetch(punkUrl, { headers: { 'Accept': 'application/json' } }),
    ]);

    let wikidataItems = [];
    if (wikidataResp.status === 'fulfilled' && wikidataResp.value.ok) {
      const data = await wikidataResp.value.json();
      const bindings = data?.results?.bindings || [];
      wikidataItems = bindings.map((b) => ({
        id: String(b.item?.value || ''),
        name: String(b.itemLabel?.value || ''),
        brewery: String(b.producerLabel?.value || 'Unknown'),
        style: String(b.styleLabel?.value || ''),
        abv: b.abv?.value ? parseFloat(b.abv.value) : null,
        imageUrl: null,
        origin: 'wikidata',
      })).filter((x) => x.name);
    }

    let punkItems = [];
    if (punkResp.status === 'fulfilled' && punkResp.value.ok) {
      const data = await punkResp.value.json();
      punkItems = (Array.isArray(data) ? data : []).map((b) => ({
        id: String(b.id ?? ''),
        name: String(b.name ?? ''),
        brewery: 'BrewDog (Punk API)',
        style: String(b.tagline ?? ''),
        abv: typeof b.abv === 'number' ? b.abv : null,
        imageUrl: b.image_url || null,
        origin: 'punkapi',
      })).filter((x) => x.name);
    }

    // Merge and dedupe by key name|brewery (case-insensitive)
    const byKey = new Map();
    const push = (item) => {
      const key = `${item.name.toLowerCase()}|${(item.brewery || '').toLowerCase()}`;
      if (!byKey.has(key)) byKey.set(key, item);
    };
    wikidataItems.forEach(push);
    punkItems.forEach(push);
    const items = Array.from(byKey.values()).slice(0, 50);

    res.json({ items });
  } catch (err) {
    console.error('Aggregate beer search failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Wikidata SPARQL search for beers (covers macro brands like Heineken)
// GET /api/beer/wikidata/search?q=...
app.get('/api/beer/wikidata/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  const sparql = `
    SELECT ?item ?itemLabel ?producerLabel ?styleLabel ?abv WHERE {
      ?item rdfs:label ?label FILTER(CONTAINS(LCASE(?label), LCASE("${q.replace(/"/g, '\\"')}")) && LANG(?label) = "en").
      ?item wdt:P31/wdt:P279* wd:Q44 .  # instance of/subclass of beer
      OPTIONAL { ?item wdt:P176 ?producer . }
      OPTIONAL { ?item wdt:P279 ?style . }
      OPTIONAL { ?item wdt:P215 ?abv . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 25`;

  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
  try {
    const r = await fetch(url, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'Brewlog/0.1 (dev)'
      }
    });
    if (!r.ok) return res.status(502).json({ error: 'Upstream error', status: r.status });
    const data = await r.json();
    const bindings = data?.results?.bindings || [];
    const items = bindings.map((b) => ({
      id: String(b.item?.value || ''),
      name: String(b.itemLabel?.value || ''),
      brewery: String(b.producerLabel?.value || 'Unknown'),
      style: String(b.styleLabel?.value || ''),
      abv: b.abv?.value ? parseFloat(b.abv.value) : null,
      imageUrl: null,
      origin: 'wikidata',
    })).filter((x) => x.name);
    res.json({ items });
  } catch (err) {
    console.error('Wikidata search failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
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

// Local dataset search — reliable and fast. Useful as first fallback.
app.get('/api/beer/local/search', async (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  const items = LOCAL_BEERS.filter((b) => {
    const hay = `${b.name} ${b.brewery} ${b.style}`.toLowerCase();
    return hay.includes(q);
  }).slice(0, 25).map((b) => ({
    id: String(b.id),
    name: String(b.name),
    brewery: String(b.brewery || 'Unknown'),
    style: String(b.style || ''),
    abv: typeof b.abv === 'number' ? b.abv : null,
    imageUrl: b.imageUrl || null,
  }));

  res.json({ items });
});

// Mount modular beer router under /api/beer
app.use('/api/beer', beerRouter);

app.listen(PORT, () => {
  console.log(`Beer API server listening on http://localhost:${PORT}`);
});
