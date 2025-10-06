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
  ibu?: number; // International Bitterness Units
  rating: number;
  appearance?: string; // Visual notes (color, clarity, head)
  aroma?: string; // Smell notes
  taste?: string; // Flavor notes
  mouthfeel?: string; // Texture, body, carbonation
  notes: string; // Overall notes
  location?: string;
  servingType?: string; // Draft, Bottle, Can
  glassware?: string; // Pint, Tulip, Snifter, etc.
  pairingFood?: string; // What food was paired
  imageUrl?: string; // Photo of the beer
  drankAt: Date;
  createdAt: Date;
}

export interface CreateJournalEntryInput {
  beerId: BeerId;
  beerName: string;
  brewery: string;
  style: string;
  abv: number;
  ibu?: number;
  rating: number;
  appearance?: string;
  aroma?: string;
  taste?: string;
  mouthfeel?: string;
  notes: string;
  location?: string;
  servingType?: string;
  glassware?: string;
  pairingFood?: string;
  imageUrl?: string;
  drankAt: Date;
}
