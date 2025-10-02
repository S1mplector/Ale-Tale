import { BeerId } from './Beer';
import { Rating } from '../valueObjects/Rating';

export type JournalEntryId = string;

export interface JournalEntry {
  id: JournalEntryId;
  beerId: BeerId;
  beerName: string;
  brewery: string;
  style: string;
  abv: number;
  rating: number;
  notes: string;
  location?: string;
  drankAt: Date;
  createdAt: Date;
}

export interface CreateJournalEntryInput {
  beerId: BeerId;
  beerName: string;
  brewery: string;
  style: string;
  abv: number;
  rating: number;
  notes: string;
  location?: string;
  drankAt: Date;
}
