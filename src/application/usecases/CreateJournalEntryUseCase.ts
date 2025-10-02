import { JournalEntry, CreateJournalEntryInput } from '@domain/entities/JournalEntry';
import { JournalEntryRepository } from '@domain/repositories/JournalEntryRepository';

export class CreateJournalEntryUseCase {
  constructor(private repo: JournalEntryRepository) {}

  async execute(input: CreateJournalEntryInput): Promise<JournalEntry> {
    return this.repo.create(input);
  }
}
