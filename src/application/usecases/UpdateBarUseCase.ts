import { BarRepository } from '@domain/repositories/BarRepository';
import { Bar, BarId, CreateBarInput } from '@domain/entities/Bar';

export class UpdateBarUseCase {
  constructor(private barRepository: BarRepository) {}

  async execute(id: BarId, input: Partial<CreateBarInput>): Promise<Bar> {
    return this.barRepository.update(id, input);
  }
}
