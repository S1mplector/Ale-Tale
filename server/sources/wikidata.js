export async function searchWikidata(q) {
  const sparql = `
    SELECT ?item ?itemLabel ?producerLabel ?styleLabel ?abv WHERE {
      ?item rdfs:label ?label FILTER(CONTAINS(LCASE(?label), LCASE("${q.replace(/"/g, '\\"')}")) && LANG(?label) = "en").
      ?item wdt:P31/wdt:P279* wd:Q44 .
      OPTIONAL { ?item wdt:P176 ?producer . }
      OPTIONAL { ?item wdt:P279 ?style . }
      OPTIONAL { ?item wdt:P215 ?abv . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 25`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
  const r = await fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'Brewlog/0.1 (dev)'
    }
  });
  if (!r.ok) throw new Error(`wikidata upstream ${r.status}`);
  const data = await r.json();
  const bindings = data?.results?.bindings || [];
  return bindings
    .map((b) => ({
      id: String(b.item?.value || ''),
      name: String(b.itemLabel?.value || ''),
      brewery: String(b.producerLabel?.value || 'Unknown'),
      style: String(b.styleLabel?.value || ''),
      abv: b.abv?.value ? parseFloat(b.abv.value) : null,
      imageUrl: null,
      origin: 'wikidata',
    }))
    .filter((x) => x.name);
}
