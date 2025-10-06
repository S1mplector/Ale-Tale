import { BarRepository } from '@domain/repositories/BarRepository';
import { Bar, BarId } from '@domain/entities/Bar';

export class GetBarUseCase {
  constructor(private barRepository: BarRepository) {}

  async execute(id: BarId): Promise<Bar | null> {
    return this.barRepository.findById(id);
  }
}
