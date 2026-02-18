# Data Room Home Assignment

Single-page Data Room MVP built with React + TypeScript + MUI.

## Demo

- Public URL: `TODO: add deployment URL`

## Features

- Data Room CRUD
- Nested folder CRUD with cascade delete
- PDF upload, rename, delete, and preview
- Duplicate-name validation (case-insensitive, trim-normalized)
- Folder breadcrumbs and tree navigation
- Sorting by name/type/updated with persisted preference
- Localized UI (`en`, `de`)

## Architecture

- UI: React function components with feature-first structure under `src/features`.
- State: `Context + useReducer` in `src/features/dataroom/state`.
- Domain logic: pure operations in `src/features/dataroom/model` (validation, tree mutations, delete analysis).
- Persistence:
  - Metadata persisted in `localStorage`.
  - PDF blobs persisted in IndexedDB for stable previews.
- Testing:
  - Unit tests for mutation/validation/sorting.
  - Integration tests for core end-to-end flows.

## Tradeoffs

- Chose client-only persistence for fast implementation and local reproducibility.
- Kept reducer operations pure to reduce regression risk in nested tree operations.
- Avoided backend/auth in core scope to prioritize reliability of CRUD and validation behavior.

## Requirements

- Node.js LTS
- npm

## Run Locally

```bash
npm install
npm run dev
```

## Run With Docker

Build and run:

```bash
docker compose up --build
```

Then open:

- `http://localhost:8080`

## Quality Checks

```bash
npm run lint
npm run test:run
npm run build
```

## Testing Checklist

- Create, rename, and delete folders in nested structures.
- Verify duplicate-name errors for data rooms, folders, and files.
- Upload PDF, rename it, preview it, and delete it.
- Delete folder subtree and verify descendant cleanup.
- Change sort mode and verify preference persists after reload.
- Switch language between English and German.

## Localization

- Runtime catalogs:
  - `src/i18n/locales/en/common.json`
  - `src/i18n/locales/de/common.json`
- Gettext catalogs:
  - `gettext/messages.pot`
  - `gettext/en/common.po`
  - `gettext/de/common.po`

Useful commands:

```bash
npm run i18n:extract
npm run i18n:gettext:compile
npm run i18n:sync
```

## Known Limitations

- No backend or multi-user sync.
- Data is browser-local only.
- Large-file behavior depends on browser storage limits.

## Future Improvements

- Add backend persistence and sharing.
- Add robust file indexing/search.
- Add role-based access model and audit trail.
