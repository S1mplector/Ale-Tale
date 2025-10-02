import { Beer } from '../entities/Beer';

export interface BeerRepository {
  list(): Promise<Beer[]>;
}
