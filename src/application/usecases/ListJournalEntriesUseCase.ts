import { JournalEntry } from '@domain/entities/JournalEntry';
import { JournalEntryRepository } from '@domain/repositories/JournalEntryRepository';

export class ListJournalEntriesUseCase {
  constructor(private repo: JournalEntryRepository) {}

  async execute(): Promise<JournalEntry[]> {
    const entries = await this.repo.list();
    // Sort by drankAt date, most recent first
    return entries.sort((a, b) => b.drankAt.getTime() - a.drankAt.getTime());
  }
}
