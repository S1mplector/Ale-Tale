import {
  Bar,
  CreateBarInput,
  BarId,
} from '@domain/entities/Bar';
import { BarRepository } from '@domain/repositories/BarRepository';
import { storageAdapter } from '@infrastructure/storage/StorageAdapter';

const STORAGE_KEY = 'bars';

export class FileSystemBarRepository implements BarRepository {
  private deserialize(data: any[]): Bar[] {
    return data.map((bar: any) => ({
      ...bar,
      visitedAt: new Date(bar.visitedAt),
      createdAt: new Date(bar.createdAt),
    }));
  }

  private async load(): Promise<Bar[]> {
    const data = await storageAdapter.read<any[]>(STORAGE_KEY);
    if (!data) return [];
    return this.deserialize(data);
  }

  private async save(bars: Bar[]): Promise<void> {
    await storageAdapter.write(STORAGE_KEY, bars);
  }

  async findAll(): Promise<Bar[]> {
    return await this.load();
  }

  async findById(id: BarId): Promise<Bar | null> {
    const bars = await this.load();
    return bars.find((b) => b.id === id) || null;
  }

  async create(input: CreateBarInput): Promise<Bar> {
    const bars = await this.load();
    const newBar: Bar = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
    };
    bars.push(newBar);
    await this.save(bars);
    return newBar;
  }

  async update(id: BarId, input: Partial<CreateBarInput>): Promise<Bar> {
    const bars = await this.load();
    const index = bars.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Bar with id ${id} not found`);
    }
    const updated: Bar = {
      ...bars[index],
      ...input,
    };
    bars[index] = updated;
    await this.save(bars);
    return updated;
  }

  async delete(id: BarId): Promise<void> {
    const bars = await this.load();
    const filtered = bars.filter((b) => b.id !== id);
    await this.save(filtered);
  }
}
