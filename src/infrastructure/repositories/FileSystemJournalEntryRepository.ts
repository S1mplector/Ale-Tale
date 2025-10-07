import {
  JournalEntry,
  CreateJournalEntryInput,
  JournalEntryId,
} from '@domain/entities/JournalEntry';
import { JournalEntryRepository } from '@domain/repositories/JournalEntryRepository';
import { storageAdapter } from '@infrastructure/storage/StorageAdapter';

const STORAGE_KEY = 'journal_entries';

export class FileSystemJournalEntryRepository implements JournalEntryRepository {
  private deserialize(data: any[]): JournalEntry[] {
    return data.map((entry: any) => ({
      ...entry,
      drankAt: new Date(entry.drankAt),
      createdAt: new Date(entry.createdAt),
    }));
  }

  private async load(): Promise<JournalEntry[]> {
    const data = await storageAdapter.read<any[]>(STORAGE_KEY);
    if (!data) return [];
    return this.deserialize(data);
  }

  private async save(entries: JournalEntry[]): Promise<void> {
    await storageAdapter.write(STORAGE_KEY, entries);
  }

  async list(): Promise<JournalEntry[]> {
    return await this.load();
  }

  async getById(id: JournalEntryId): Promise<JournalEntry | null> {
    const entries = await this.load();
    return entries.find((e) => e.id === id) || null;
  }

  async create(input: CreateJournalEntryInput): Promise<JournalEntry> {
    const entries = await this.load();
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
    };
    entries.push(newEntry);
    await this.save(entries);
    return newEntry;
  }

  async update(entry: JournalEntry): Promise<JournalEntry> {
    const entries = await this.load();
    const index = entries.findIndex((e) => e.id === entry.id);
    if (index === -1) {
      throw new Error(`Entry with id ${entry.id} not found`);
    }
    entries[index] = entry;
    await this.save(entries);
    return entry;
  }

  async delete(id: JournalEntryId): Promise<void> {
    const entries = await this.load();
    const filtered = entries.filter((e) => e.id !== id);
    await this.save(filtered);
  }
}
