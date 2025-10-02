import { Beer } from '@domain/entities/Beer';
import { BeerRepository } from '@domain/repositories/BeerRepository';

const STORAGE_KEY = 'aletale_beers';

const defaultBeers: Beer[] = [
  { id: '1', name: 'Pliny the Elder', brewery: 'Russian River', style: 'Double IPA', abv: 8 },
  { id: '2', name: 'Guinness Draught', brewery: 'Guinness', style: 'Stout', abv: 4.2 },
  {
    id: '3',
    name: 'Weihenstephaner Hefeweissbier',
    brewery: 'Weihenstephan',
    style: 'Hefeweizen',
    abv: 5.4,
  },
];

export class LocalStorageBeerRepository implements BeerRepository {
  constructor() {
    // Initialize with default beers if empty
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultBeers));
    }
  }

  async list(): Promise<Beer[]> {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return Promise.resolve(JSON.parse(data));
  }
}
