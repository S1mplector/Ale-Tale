import { JournalEntry } from '@domain/entities/JournalEntry';
import { JournalEntryRepository } from '@domain/repositories/JournalEntryRepository';

export class UpdateJournalEntryUseCase {
  constructor(private repo: JournalEntryRepository) {}

  async execute(entry: JournalEntry): Promise<JournalEntry> {
    return this.repo.update(entry);
  }
}
