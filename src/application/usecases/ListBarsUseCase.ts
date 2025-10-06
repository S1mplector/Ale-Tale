import { BarRepository } from '@domain/repositories/BarRepository';
import { Bar } from '@domain/entities/Bar';

export class ListBarsUseCase {
  constructor(private barRepository: BarRepository) {}

  async execute(): Promise<Bar[]> {
    const bars = await this.barRepository.findAll();
    // Sort by visitedAt descending (most recent first)
    return bars.sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime());
  }
}
