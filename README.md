# Brewlog 🍺

A beer journaling and logging web app built with React + TypeScript using a clean, layered architecture.

## Features

- **Journal Entries**: Log beers you've tried with ratings, tasting notes, location, and date
- **Star Ratings**: Rate beers from 0-5 stars with half-star precision
- **Persistent Storage**: Data stored in browser localStorage
- **Responsive UI**: Clean, modern interface with intuitive navigation
- **Three Pages**:
  - Home: View all journal entries sorted by date
  - Add Entry: Create new journal entries
  - Entry Detail: View full details of a specific entry

## Architecture

This project follows clean architecture principles with clear separation of concerns:

### Layers

- **domain/**: Pure domain model with no external dependencies
  - `entities/`: Domain entities (Beer, JournalEntry)
  - `valueObjects/`: Value objects (Rating)
  - `repositories/`: Repository interfaces
- **application/**: Business logic orchestration via use cases
  - `usecases/`: Use case implementations (Create, List, Get, Delete)
- **infrastructure/**: External concerns and implementations
  - `repositories/`: Concrete repository implementations (localStorage)
- **presentation/**: React UI components, pages, and routing
  - `components/`: Reusable UI components (Layout)
  - `pages/`: Route-level page components
- **di/**: Dependency injection container (composition root)
- **shared/**: Cross-cutting utilities and helpers

### Key Principles

- **Dependency Rule**: Dependencies point inward (presentation → application → domain)
- **Interface Segregation**: Domain defines interfaces; infrastructure implements them
- **Single Responsibility**: Each layer has one reason to change
- **Testability**: Business logic isolated from UI and persistence details

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── domain/
│   ├── entities/
│   │   ├── Beer.ts
│   │   └── JournalEntry.ts
│   ├── repositories/
│   │   ├── BeerRepository.ts
│   │   └── JournalEntryRepository.ts
│   └── valueObjects/
│       └── Rating.ts
├── application/
│   └── usecases/
│       ├── CreateJournalEntryUseCase.ts
│       ├── ListJournalEntriesUseCase.ts
│       ├── GetJournalEntryUseCase.ts
│       ├── DeleteJournalEntryUseCase.ts
│       └── ListBeersUseCase.ts
├── infrastructure/
│   └── repositories/
│       ├── LocalStorageBeerRepository.ts
│       └── LocalStorageJournalEntryRepository.ts
├── presentation/
│   ├── components/
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── AddEntryPage.tsx
│   │   └── EntryDetailPage.tsx
│   └── App.tsx
├── di/
│   └── container.ts
└── main.tsx
```

## Path Aliases

TypeScript path aliases configured in `tsconfig.app.json` and `vite.config.ts`:

- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@infrastructure/*` → `src/infrastructure/*`
- `@presentation/*` → `src/presentation/*`
- `@shared/*` → `src/shared/*`
- `@di/*` → `src/di/*`

## Tech Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Vitest** - Unit testing framework
- **Testing Library** - React component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Future Enhancements

- Add beer search/autocomplete from external API (e.g., Open Brewery DB)
- Support photo uploads for entries
- Add filtering/sorting (by rating, style, brewery)
- Export journal data (JSON, CSV)
- Statistics dashboard (average ratings, favorite styles)
- Backend API integration for multi-device sync
- PWA support for offline functionality
- Social features (share entries, compare ratings)
