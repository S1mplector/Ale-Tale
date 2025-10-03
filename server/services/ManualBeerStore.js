import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const FILE_PATH = path.join(DATA_DIR, 'manual_beers.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, '[]', 'utf-8');
}

export function listManualBeers() {
  try {
    ensureFile();
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addManualBeer(beer) {
  ensureFile();
  const items = listManualBeers();
  // dedupe by name|brewery
  const key = `${String(beer.name).toLowerCase()}|${String(beer.brewery || '').toLowerCase()}`;
  const exists = items.find(
    (b) => `${String(b.name).toLowerCase()}|${String(b.brewery || '').toLowerCase()}` === key
  );
  if (!exists) {
    items.unshift({ ...beer, origin: 'manual' });
    fs.writeFileSync(FILE_PATH, JSON.stringify(items, null, 2), 'utf-8');
  }
  return beer;
}

export function searchManualBeers(q) {
  const hay = String(q).toLowerCase();
  return listManualBeers()
    .filter((b) => `${b.name} ${b.brewery} ${b.style}`.toLowerCase().includes(hay))
    .slice(0, 25);
}
