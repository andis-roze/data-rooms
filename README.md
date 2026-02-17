# Polyglot UI Starter

Minimal React + TypeScript starter with:
- Vite
- i18next + react-i18next + i18next-icu
- React Router
- MUI theme
- Vitest + Testing Library

## Requirements

- Node.js LTS
- npm

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run test:run
npm run build
```

## Localization setup

Runtime translations are file-based and stored in:
- `src/i18n/locales/en/common.json`
- `src/i18n/locales/de/common.json`

Translator-facing catalogs are gettext-based and stored in:
- `gettext/messages.pot`
- `gettext/en/common.po`
- `gettext/de/common.po`

The app loads JSON catalogs via `src/i18n/resources.ts`.

### Automatic key extraction

Extract keys from `t('...')` usage, update `en` JSON, and sync gettext catalogs:

```bash
npm run i18n:extract
```

This uses `i18next-parser` (`i18next-parser.config.cjs`) and writes to:
- `src/i18n/locales/en/common.json`
- `gettext/messages.pot`
- `gettext/en/common.po`
- `gettext/<lang>/common.po`

### Compile gettext catalogs for runtime

Compile PO files back to runtime JSON:

```bash
npm run i18n:gettext:compile
```

For convenience, `npm run i18n:sync` runs:
- `i18n:extract`
- `i18n:gettext:compile`

### Typical workflow

1. Add new UI key in code (`t('newKey')`).
2. Run `npm run i18n:extract`.
3. Translate in `gettext/<lang>/common.po`.
4. Run `npm run i18n:gettext:compile`.
5. Commit updated `.po`, `.pot`, and locale JSON files.

## Notes

- ICU messages are enabled, so plural and number formatting are locale-aware in translation strings.
- For non-English catalogs, empty PO translations are omitted in JSON output so runtime falls back to English.
