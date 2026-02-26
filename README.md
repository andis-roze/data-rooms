# Data Room Home Assignment

Single-page Data Room MVP built with React + TypeScript + MUI.

## Documentation

- User documentation: [User Guide](docs/USER_GUIDE.md)
- Technical/developer documentation: [Technical Guide](docs/TECHNICAL_GUIDE.md)

## Demo

- Public URL: [https://data-rooms-two.vercel.app/](https://data-rooms-two.vercel.app/)
- Deployment: auto-deploy from `main` branch (Vercel Git integration)
- Recorded walkthroughs:
  - `artifacts/demo-video/demo-full-ux-slow.webm`
  - `artifacts/demo-video/demo-full-ux-slowest.webm`
  - `artifacts/demo-video/demo-full-ux-ultra-slow.webm` (recommended for review)

## Quick Start

Requirements:

- Node.js LTS
- npm

Run locally:

```bash
npm install
npm run dev
```

Run with Docker:

```bash
docker compose up --build
```

Then open:

- `http://localhost:8080`

## Quality Checks

```bash
npm run lint
npm run test:run
npm run test:smoke:home
npm run audit:unused
npm run audit:unused:types
npm run build
```

Install git hooks and run the pre-push checks manually:

```bash
npm run hooks:install
npm run hooks:pre-push
```

## Localization

Useful commands:

```bash
npm run i18n:extract
npm run i18n:gettext:compile
npm run i18n:sync
npm run i18n:verify-sync
```
