import { Bar, BarId, CreateBarInput } from '../entities/Bar';

export interface BarRepository {
  create(input: CreateBarInput): Promise<Bar>;
  findAll(): Promise<Bar[]>;
  findById(id: BarId): Promise<Bar | null>;
  delete(id: BarId): Promise<void>;
  update(id: BarId, input: Partial<CreateBarInput>): Promise<Bar>;
}
