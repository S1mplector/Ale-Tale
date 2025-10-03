import type { Beer } from '@domain/entities/Beer';

export interface BeerSearchItemApi {
  id: string;
  name: string;
  brewery: string;
  style: string;
  abv: number | null;
  imageUrl?: string | null;
  origin?: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

export async function searchBeers(query: string): Promise<Beer[]> {
  const q = query.trim();
  if (!q) return [];

  // 1) Aggregate endpoint (Wikidata + Punk)
  try {
    const data = await fetchJson<{ items: BeerSearchItemApi[] }>(`/api/beer/aggregate/search?q=${encodeURIComponent(q)}`);
    const items = (data.items || []).map(toDomainBeer);
    if (items.length > 0) return items;
  } catch (_e) {
    // ignore and fallback
  }

  // 2) Direct Punk API proxy
  try {
    const data = await fetchJson<{ items: BeerSearchItemApi[] }>(`/api/beer/search?q=${encodeURIComponent(q)}`);
    return (data.items || []).map(toDomainBeer);
  } catch (_e) {
    return [];
  }
}

function toDomainBeer(it: BeerSearchItemApi): Beer {
  return {
    id: it.id,
    name: it.name,
    brewery: it.brewery,
    style: it.style,
    abv: typeof it.abv === 'number' ? it.abv : 0,
  };
}
