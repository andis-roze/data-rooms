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
- Optional Google auth gate with immediate post-auth Google Drive ping

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
- Kept Google auth optional and environment-driven so local/core workflows still run without external credentials.

## Requirements

- Node.js LTS
- npm
- Optional for auth flow: Google OAuth Web Client ID

## Run Locally

```bash
npm install
npm run dev
```

Optional auth setup (`.env.local`):

```bash
VITE_GOOGLE_CLIENT_ID=your_google_oauth_web_client_id
```

When configured, the app requires Google sign-in for the Home page and immediately performs a lightweight Drive API ping after login.

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
- Google auth is client-side OAuth and depends on correct Google Cloud OAuth origin configuration.

## Future Improvements

- Add backend persistence and sharing.
- Add robust file indexing/search.
- Add role-based access model and audit trail.
