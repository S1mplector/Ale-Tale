import { Beer } from '@domain/entities/Beer';
import { BeerRepository } from '@domain/repositories/BeerRepository';

const seed: Beer[] = [
  { id: '1', name: 'Pliny the Elder', brewery: 'Russian River', style: 'Double IPA', abv: 8 },
  { id: '2', name: 'Guinness Draught', brewery: 'Guinness', style: 'Stout', abv: 4.2 },
];

export class InMemoryBeerRepository implements BeerRepository {
  private data = [...seed];

  async list(): Promise<Beer[]> {
    return Promise.resolve(this.data);
  }
}
