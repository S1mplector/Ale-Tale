import { Beer } from '@domain/entities/Beer';
import { BeerRepository } from '@domain/repositories/BeerRepository';

export class ListBeersUseCase {
  constructor(private repo: BeerRepository) {}

  async execute(): Promise<Beer[]> {
    return this.repo.list();
  }
}
