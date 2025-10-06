export type BarId = string;

export interface Bar {
  id: BarId;
  name: string;
  address: string;
  city: string;
  rating: number; // 0-5 stars
  atmosphere?: string; // Cozy, lively, quiet, etc.
  beerSelection?: string; // Description of beer selection
  foodQuality?: string; // Food quality notes
  service?: string; // Service quality
  priceRange?: string; // $, $$, $$$, $$$$
  amenities?: string[]; // Outdoor seating, live music, WiFi, etc.
  favoriteBeers?: string; // Favorite beers tried here
  notes: string;
  visitedAt: Date;
  createdAt: Date;
}

export interface CreateBarInput {
  name: string;
  address: string;
  city: string;
  rating: number;
  atmosphere?: string;
  beerSelection?: string;
  foodQuality?: string;
  service?: string;
  priceRange?: string;
  amenities?: string[];
  favoriteBeers?: string;
  notes: string;
  visitedAt: Date;
}
