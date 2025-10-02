import { LocalStorageBeerRepository } from '@infrastructure/repositories/LocalStorageBeerRepository';
import { LocalStorageJournalEntryRepository } from '@infrastructure/repositories/LocalStorageJournalEntryRepository';
import { ListBeersUseCase } from '@application/usecases/ListBeersUseCase';
import { CreateJournalEntryUseCase } from '@application/usecases/CreateJournalEntryUseCase';
import { ListJournalEntriesUseCase } from '@application/usecases/ListJournalEntriesUseCase';
import { GetJournalEntryUseCase } from '@application/usecases/GetJournalEntryUseCase';
import { DeleteJournalEntryUseCase } from '@application/usecases/DeleteJournalEntryUseCase';
import { UpdateJournalEntryUseCase } from '@application/usecases/UpdateJournalEntryUseCase';

// Repositories
const beerRepository = new LocalStorageBeerRepository();
const journalEntryRepository = new LocalStorageJournalEntryRepository();

// Use Cases
export const listBeersUseCase = new ListBeersUseCase(beerRepository);
export const createJournalEntryUseCase = new CreateJournalEntryUseCase(journalEntryRepository);
export const listJournalEntriesUseCase = new ListJournalEntriesUseCase(journalEntryRepository);
export const getJournalEntryUseCase = new GetJournalEntryUseCase(journalEntryRepository);
export const deleteJournalEntryUseCase = new DeleteJournalEntryUseCase(journalEntryRepository);
export const updateJournalEntryUseCase = new UpdateJournalEntryUseCase(journalEntryRepository);
