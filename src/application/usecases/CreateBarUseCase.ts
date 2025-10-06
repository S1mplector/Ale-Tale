import { BarRepository } from '@domain/repositories/BarRepository';
import { Bar, CreateBarInput } from '@domain/entities/Bar';

export class CreateBarUseCase {
  constructor(private barRepository: BarRepository) {}

  async execute(input: CreateBarInput): Promise<Bar> {
    return this.barRepository.create(input);
  }
}
