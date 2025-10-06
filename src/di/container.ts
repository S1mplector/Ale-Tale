import { LocalStorageBeerRepository } from '@infrastructure/repositories/LocalStorageBeerRepository';
import { LocalStorageJournalEntryRepository } from '@infrastructure/repositories/LocalStorageJournalEntryRepository';
import { LocalStorageBarRepository } from '@infrastructure/repositories/LocalStorageBarRepository';
import { ListBeersUseCase } from '@application/usecases/ListBeersUseCase';
import { CreateJournalEntryUseCase } from '@application/usecases/CreateJournalEntryUseCase';
import { ListJournalEntriesUseCase } from '@application/usecases/ListJournalEntriesUseCase';
import { GetJournalEntryUseCase } from '@application/usecases/GetJournalEntryUseCase';
import { DeleteJournalEntryUseCase } from '@application/usecases/DeleteJournalEntryUseCase';
import { UpdateJournalEntryUseCase } from '@application/usecases/UpdateJournalEntryUseCase';
import { CreateBarUseCase } from '@application/usecases/CreateBarUseCase';
import { ListBarsUseCase } from '@application/usecases/ListBarsUseCase';
import { GetBarUseCase } from '@application/usecases/GetBarUseCase';
import { DeleteBarUseCase } from '@application/usecases/DeleteBarUseCase';
import { UpdateBarUseCase } from '@application/usecases/UpdateBarUseCase';

// Repositories
const beerRepository = new LocalStorageBeerRepository();
const journalEntryRepository = new LocalStorageJournalEntryRepository();
const barRepository = new LocalStorageBarRepository();

// Use Cases
export const listBeersUseCase = new ListBeersUseCase(beerRepository);
export const createJournalEntryUseCase = new CreateJournalEntryUseCase(journalEntryRepository);
export const listJournalEntriesUseCase = new ListJournalEntriesUseCase(journalEntryRepository);
export const getJournalEntryUseCase = new GetJournalEntryUseCase(journalEntryRepository);
export const deleteJournalEntryUseCase = new DeleteJournalEntryUseCase(journalEntryRepository);
export const updateJournalEntryUseCase = new UpdateJournalEntryUseCase(journalEntryRepository);
export const createBarUseCase = new CreateBarUseCase(barRepository);
export const listBarsUseCase = new ListBarsUseCase(barRepository);
export const getBarUseCase = new GetBarUseCase(barRepository);
export const deleteBarUseCase = new DeleteBarUseCase(barRepository);
export const updateBarUseCase = new UpdateBarUseCase(barRepository);
