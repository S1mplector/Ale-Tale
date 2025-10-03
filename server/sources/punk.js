export async function searchPunk(q) {
  const url = `https://api.punkapi.com/v2/beers?beer_name=${encodeURIComponent(q)}&per_page=25`;
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`punkapi upstream ${r.status}`);
  const data = await r.json();
  const items = (Array.isArray(data) ? data : []).map((b) => ({
    id: String(b.id ?? ''),
    name: String(b.name ?? ''),
    brewery: 'BrewDog (Punk API)',
    style: String(b.tagline ?? ''),
    abv: typeof b.abv === 'number' ? b.abv : null,
    imageUrl: b.image_url || null,
    origin: 'punkapi',
  })).filter((x) => x.name);
  return items;
}
