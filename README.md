# Brewlog

A beer journaling and logging web app built with React + TypeScript using a clean, layered architecture.

## Layers

- **domain/**: Pure domain model. Entities, value objects, repository interfaces.
- **application/**: Use cases (business logic orchestrators) depending on domain interfaces.
- **infrastructure/**: Implementations of domain interfaces (e.g., repositories, APIs, persistence).
- **presentation/**: React components, pages, and routing. Consumes use cases via DI.
- **di/**: Composition root that wires concrete implementations into abstractions.
- **shared/**: Cross-cutting helpers, types, and constants.

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test
```

Open the app at http://localhost:5173 (default Vite port).

## Notable Files

- `index.html`: Vite entry HTML.
- `src/main.tsx`: React bootstrap.
- `src/presentation/App.tsx`: Root component.
- `src/presentation/pages/HomePage.tsx`: Example page using a use case.
- `src/application/usecases/ListBeersUseCase.ts`: Sample use case.
- `src/domain/entities/Beer.ts`: Domain entity.
- `src/domain/repositories/BeerRepository.ts`: Domain repository interface.
- `src/infrastructure/repositories/InMemoryBeerRepository.ts`: In-memory repository implementation.
- `src/di/container.ts`: DI wiring.

## Path Aliases

Configured in `tsconfig.app.json` and `vite.config.ts`:

- `@domain/*` -> `src/domain/*`
- `@application/*` -> `src/application/*`
- `@infrastructure/*` -> `src/infrastructure/*`
- `@presentation/*` -> `src/presentation/*`
- `@shared/*` -> `src/shared/*`
- `@di/*` -> `src/di/*`

## Linting & Formatting

- ESLint: `npm run lint`
- Prettier: `npm run format`

## Next Steps

- Add create/log journal entries for beers (entity + use cases).
- Persist to localStorage or IndexedDB, then later to a backend API.
- Introduce routing and a proper UI library.
