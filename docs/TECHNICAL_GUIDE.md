# Data Room Technical Guide

This document covers architecture, development workflow, testing, and operational details.

## Stack

- React 19
- TypeScript
- MUI
- React Router
- i18next + gettext extraction/compile workflow
- Vitest + Testing Library
- Vite

## Project Structure

- `src/app`: app bootstrap, providers, router, theme
- `src/features/dataroom`: domain state, reducer, pure model operations, persistence
- `src/features/home`: home page orchestration, UI components, hooks, selectors, services
- `src/i18n`: runtime i18n setup and locale resources
- `src/test`: unit + integration tests
- `scripts`: pre-push and i18n support scripts

## Architecture Overview

### State Management

- Global state uses `Context + useReducer` in `src/features/dataroom/state`
- Reducer delegates to pure mutation/selector utilities in `src/features/dataroom/model`

### Domain Model and Mutations

Core domain logic lives in `src/features/dataroom/model`:

- Validation rules and duplicate checks
- Immutable tree mutations
- Delete impact analysis
- Selection and traversal helpers

Mutation modules are split under:

- `src/features/dataroom/model/mutations/dataRoom.ts`
- `src/features/dataroom/model/mutations/folder.ts`
- `src/features/dataroom/model/mutations/file.ts`
- `src/features/dataroom/model/mutations/shared.ts`
- `src/features/dataroom/model/mutations/types.ts`

Compatibility exports remain through `src/features/dataroom/model/treeMutations.ts`.

### Home Feature Composition

Home orchestration is centered in `src/features/home/useHomePageController.ts`, with focused hooks for:

- selection workflow
- move workflow
- feedback queue
- selected-content delete flow
- UI/form/transient state
- sidebar behavior

UI has been decomposed into focused components for sidebar/content/page shell concerns.

### Side Effects and DIP Boundary

File blob operations use `FileBlobStorageService`:

- `src/features/home/services/fileBlobStorage.ts`

This isolates storage side effects from UI/action orchestration and improves testability.

## Persistence

- Metadata: `localStorage`
- File blobs: IndexedDB

Relevant modules:

- `src/features/dataroom/model/storage.ts`
- `src/features/dataroom/model/blobStorage.ts`

## i18n and Localization

Runtime locale files:

- `src/i18n/locales/en/common.json`
- `src/i18n/locales/de/common.json`

Gettext files:

- `gettext/messages.pot`
- `gettext/en/common.po`
- `gettext/de/common.po`

Commands:

```bash
npm run i18n:extract
npm run i18n:gettext:compile
npm run i18n:sync
npm run i18n:verify-sync
```

## Development

### Requirements

- Node.js LTS
- npm

### Local Run

```bash
npm install
npm run dev
```

### Docker Run

```bash
docker compose up --build
```

App URL: `http://localhost:8080`

## UX Walkthrough Video Recording

One-command automated recording:

```bash
npm run record:ux
```

Slower presets:

```bash
npm run record:ux:slow
npm run record:ux:slower
```

If Chromium is not installed for Playwright yet:

```bash
npm run record:ux:install-browser
```

Output video files are written to `recordings/` by default.

For shared/review artifacts in this repository, use:

```bash
RECORDINGS_DIR=artifacts/demo-video npm run record:ux
```

Current provided demo recordings:

- `artifacts/demo-video/demo-full-ux-slow.webm`
- `artifacts/demo-video/demo-full-ux-slowest.webm`
- `artifacts/demo-video/demo-full-ux-ultra-slow.webm`

Speed is configurable via CLI or env:

```bash
node scripts/record-ux-walkthrough.mjs --step-delay-ms=3500 --action-delay-ms=800
```

- `--step-delay-ms` / `DEMO_STEP_DELAY_MS`: pause before and after each step
- `--action-delay-ms` / `DEMO_ACTION_DELAY_MS`: pause between key actions inside a step

## Quality Gates

Manual checks:

```bash
npm run lint
npm run test:run
npm run build
```

Pre-commit hook:

- i18n sync and verification

Pre-push hook:

- lint + test coverage verification

## Testing Strategy

- Unit tests for domain operations, sorting, selection, and sidebar workflows
- Integration tests for high-value app flows

Common test paths:

- `src/test/unit/treeOpsAndValidators.test.ts`
- `src/test/unit/selectionOps.test.ts`
- `src/test/unit/sidebarHooks.test.ts`
- `src/test/app/App.test.tsx`

## Deployment Notes (Vercel)

If repository integration is configured in Vercel:

- push to production branch (usually `main`) triggers production deployment
- push to non-production branches can trigger preview deployments

Verify in Vercel:

- Project Settings -> Git integration
- Automatic deployments enabled
- Production branch configuration

## Deployment Notes (GitHub Pages)

Live URL:

- https://andis-roze.github.io/data-rooms/

Scripts:

```bash
npm run build:gh-pages
npm run deploy:gh-pages
```

What `build:gh-pages` does:

- detects repository name and sets `VITE_BASE_PATH` (for example `/data-rooms/`)
- runs the regular production build
- creates `dist/404.html` from `dist/index.html` for SPA deep-link fallback
- writes `dist/.nojekyll`

What `deploy:gh-pages` does:

- runs `build:gh-pages` (unless `--skip-build` is passed)
- publishes `dist/` to `gh-pages` branch via `gh-pages` package

Optional pre-push auto-deploy:

- set `AUTO_DEPLOY_GH_PAGES=1` before `git push`
- pre-push quality gate runs first, then deployment runs automatically

Optional overrides:

- `GH_PAGES_BASE_PATH` (default auto-detected from repo name)
- `GH_PAGES_BRANCH` (default `gh-pages`)
- `GH_PAGES_COMMIT_MESSAGE` (default `chore(deploy): publish GitHub Pages`)

## Current Tradeoffs

- Browser-local persistence only
- No multi-user synchronization
- No backend auth/roles/audit

## Suggested Next Steps

- Add backend persistence API
- Add role-based access and audit trail
- Add CI workflow (GitHub Actions) mirroring local hook gates
- Expand targeted unit tests around controller/action hooks
