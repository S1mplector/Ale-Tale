import {
  JournalEntry,
  CreateJournalEntryInput,
  JournalEntryId,
} from '@domain/entities/JournalEntry';
import { JournalEntryRepository } from '@domain/repositories/JournalEntryRepository';

const STORAGE_KEY = 'brewlog_journal_entries';

export class LocalStorageJournalEntryRepository implements JournalEntryRepository {
  private deserialize(data: string): JournalEntry[] {
    const parsed = JSON.parse(data);
    return parsed.map((entry: any) => ({
      ...entry,
      drankAt: new Date(entry.drankAt),
      createdAt: new Date(entry.createdAt),
    }));
  }

  private serialize(entries: JournalEntry[]): string {
    return JSON.stringify(entries);
  }

  private load(): JournalEntry[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return this.deserialize(data);
  }

  private save(entries: JournalEntry[]): void {
    localStorage.setItem(STORAGE_KEY, this.serialize(entries));
  }

  async list(): Promise<JournalEntry[]> {
    return Promise.resolve(this.load());
  }

  async getById(id: JournalEntryId): Promise<JournalEntry | null> {
    const entries = this.load();
    return Promise.resolve(entries.find((e) => e.id === id) || null);
  }

  async create(input: CreateJournalEntryInput): Promise<JournalEntry> {
    const entries = this.load();
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
    };
    entries.push(newEntry);
    this.save(entries);
    return Promise.resolve(newEntry);
  }

  async update(entry: JournalEntry): Promise<JournalEntry> {
    const entries = this.load();
    const index = entries.findIndex((e) => e.id === entry.id);
    if (index === -1) {
      throw new Error(`Entry with id ${entry.id} not found`);
    }
    entries[index] = entry;
    this.save(entries);
    return Promise.resolve(entry);
  }

  async delete(id: JournalEntryId): Promise<void> {
    const entries = this.load();
    const filtered = entries.filter((e) => e.id !== id);
    this.save(filtered);
    return Promise.resolve();
  }
}
