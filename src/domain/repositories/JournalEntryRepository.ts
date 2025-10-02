import { JournalEntry, CreateJournalEntryInput, JournalEntryId } from '../entities/JournalEntry';

export interface JournalEntryRepository {
  list(): Promise<JournalEntry[]>;
  getById(id: JournalEntryId): Promise<JournalEntry | null>;
  create(input: CreateJournalEntryInput): Promise<JournalEntry>;
  update(entry: JournalEntry): Promise<JournalEntry>;
  delete(id: JournalEntryId): Promise<void>;
}
