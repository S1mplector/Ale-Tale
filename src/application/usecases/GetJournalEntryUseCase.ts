import { JournalEntry, JournalEntryId } from '@domain/entities/JournalEntry';
import { JournalEntryRepository } from '@domain/repositories/JournalEntryRepository';

export class GetJournalEntryUseCase {
  constructor(private repo: JournalEntryRepository) {}

  async execute(id: JournalEntryId): Promise<JournalEntry | null> {
    return this.repo.getById(id);
  }
}
