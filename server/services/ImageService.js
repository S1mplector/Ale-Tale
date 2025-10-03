// Simple in-memory cached image resolver with multiple providers
// Priority for speed: Google CSE (if configured) + Wikipedia in parallel, then Wikidata P18

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

export class ImageService {
  constructor() {
    this.cache = new Map(); // key -> { url, ts }
    this.googleKey = process.env.GOOGLE_CSE_KEY || '';
    this.googleCx = process.env.GOOGLE_CSE_ID || '';
  }

  _now() { return Date.now(); }

  _getCached(key) {
    const hit = this.cache.get(key);
    if (!hit) return null;
    if (this._now() - hit.ts > CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return hit.url || null;
  }

  _setCached(key, url) {
    this.cache.set(key, { url: url || null, ts: this._now() });
    return url || null;
  }

  async resolve({ name, brewery, wikidataId }) {
    const key = `${wikidataId || ''}|${name}|${brewery || ''}`.toLowerCase();
    const cached = this._getCached(key);
    if (cached !== null) return cached;

    // 1) Fast path: try Google (if configured) and Wikipedia concurrently with short timeouts
    const q = `${name} ${brewery || ''}`.trim();
    const probes = [];
    if (this.googleKey && this.googleCx) probes.push(this._withTimeout(this._fromGoogle(q), 1200));
    // Wikipedia multi-query strategy (free/unlimited)
    probes.push(this._withTimeout(this._fromWikipediaMulti(name, brewery), 1600));
    try {
      const url = await Promise.any(probes);
      if (url) return this._setCached(key, url);
    } catch {}

    // 2) Wikidata P18 (slower, but authoritative when present)
    try {
      const url = await this._withTimeout(this._fromWikidataP18(wikidataId), 2000);
      if (url) return this._setCached(key, url);
    } catch {}

    return this._setCached(key, null);
  }

  async _withTimeout(promise, ms) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      // If the underlying impl supports AbortController it should pass ctrl.signal, but for simplicity we just race a timer
      return await Promise.race([
        promise,
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
      ]);
    } finally {
      clearTimeout(t);
    }
  }

  async _fromWikipediaMulti(name, brewery) {
    const candidates = Array.from(new Set([
      `${name} ${brewery} beer`,
      `${name} beer`,
      `${name} ${brewery}`,
      `${name}`,
    ].map((s) => s.trim()).filter(Boolean)));
    for (const q of candidates) {
      const url = await this._fromWikipedia(q, 128);
      if (url) return url;
    }
    // As a last resort, try Wikidata label search to get Q-id, then P18
    const qid = await this._searchWikidataIdByText(`${name} ${brewery}`.trim());
    if (qid) {
      const url = await this._fromWikidataP18(`http://www.wikidata.org/entity/${qid}`);
      if (url) return url;
    }
    return null;
  }

  async _fromWikidataP18(wikidataId) {
    if (!wikidataId || !wikidataId.startsWith('http')) return null;
    try {
      const url = `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(wikidataId.split('/').pop())}.json`;
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!r.ok) return null;
      const data = await r.json();
      const id = Object.keys(data.entities || {})[0];
      const claims = data.entities?.[id]?.claims || {};
      const p18 = claims.P18?.[0]?.mainsnak?.datavalue?.value; // filename
      if (!p18) return null;
      // Build a thumbnail URL via Wikimedia thumb service
      const filename = p18.replace(/\s/g, '_');
      // default 96px
      return `https://commons.wikimedia.org/w/thumb.php?f=${encodeURIComponent(filename)}&w=96`;
    } catch {
      return null;
    }
  }

  async _fromWikipedia(q, size = 96) {
    if (!q) return null;
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|pageprops&piprop=thumbnail&pithumbsize=${size}&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&origin=*`;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    const data = await r.json();
    const pages = data?.query?.pages || {};
    const first = Object.values(pages)[0];
    return first?.thumbnail?.source || null;
  }

  async _searchWikidataIdByText(q) {
    if (!q) return null;
    try {
      const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=en&format=json&type=item&limit=1&origin=*`;
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!r.ok) return null;
      const data = await r.json();
      const first = Array.isArray(data.search) ? data.search[0] : null;
      return first?.id || null; // e.g., Q854383
    } catch {
      return null;
    }
  }

  async _fromGoogle(q) {
    if (!this.googleKey || !this.googleCx) return null;
    const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(this.googleKey)}&cx=${encodeURIComponent(this.googleCx)}&q=${encodeURIComponent(q)}&searchType=image&num=1&imgSize=medium`;
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    const data = await r.json();
    const item = Array.isArray(data.items) ? data.items[0] : null;
    return item?.link || null;
  }
}

export const imageService = new ImageService();
