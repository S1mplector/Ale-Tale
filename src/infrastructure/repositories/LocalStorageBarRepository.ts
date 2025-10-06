import {
  Bar,
  CreateBarInput,
  BarId,
} from '@domain/entities/Bar';
import { BarRepository } from '@domain/repositories/BarRepository';

const STORAGE_KEY = 'aletale_bars';

export class LocalStorageBarRepository implements BarRepository {
  private deserialize(data: string): Bar[] {
    const parsed = JSON.parse(data);
    return parsed.map((bar: any) => ({
      ...bar,
      visitedAt: new Date(bar.visitedAt),
      createdAt: new Date(bar.createdAt),
    }));
  }

  private serialize(bars: Bar[]): string {
    return JSON.stringify(bars);
  }

  private load(): Bar[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return this.deserialize(data);
  }

  private save(bars: Bar[]): void {
    localStorage.setItem(STORAGE_KEY, this.serialize(bars));
  }

  async findAll(): Promise<Bar[]> {
    return Promise.resolve(this.load());
  }

  async findById(id: BarId): Promise<Bar | null> {
    const bars = this.load();
    return Promise.resolve(bars.find((b) => b.id === id) || null);
  }

  async create(input: CreateBarInput): Promise<Bar> {
    const bars = this.load();
    const newBar: Bar = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
    };
    bars.push(newBar);
    this.save(bars);
    return Promise.resolve(newBar);
  }

  async update(id: BarId, input: Partial<CreateBarInput>): Promise<Bar> {
    const bars = this.load();
    const index = bars.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error(`Bar with id ${id} not found`);
    }
    const updated: Bar = {
      ...bars[index],
      ...input,
    };
    bars[index] = updated;
    this.save(bars);
    return Promise.resolve(updated);
  }

  async delete(id: BarId): Promise<void> {
    const bars = this.load();
    const filtered = bars.filter((b) => b.id !== id);
    this.save(filtered);
    return Promise.resolve();
  }
}
