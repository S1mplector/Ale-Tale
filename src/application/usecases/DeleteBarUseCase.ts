import { BarRepository } from '@domain/repositories/BarRepository';
import { BarId } from '@domain/entities/Bar';

export class DeleteBarUseCase {
  constructor(private barRepository: BarRepository) {}

  async execute(id: BarId): Promise<void> {
    return this.barRepository.delete(id);
  }
}
