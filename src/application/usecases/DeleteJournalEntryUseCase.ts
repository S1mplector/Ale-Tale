import { JournalEntryId } from '@domain/entities/JournalEntry';
import { JournalEntryRepository } from '@domain/repositories/JournalEntryRepository';

export class DeleteJournalEntryUseCase {
  constructor(private repo: JournalEntryRepository) {}

  async execute(id: JournalEntryId): Promise<void> {
    return this.repo.delete(id);
  }
}
