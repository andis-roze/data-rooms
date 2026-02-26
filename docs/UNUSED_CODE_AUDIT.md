# Unused Code Audit (Step 2)

This step adds static audit commands only (no code removals yet).

## Commands

```bash
npm run audit:unused:types
npm run audit:unused:exports
npm run audit:unused:deps
npm run audit:unused
```

## What each check does

- `audit:unused:types`
  - TypeScript compile-only audit for unused locals/parameters.
- `audit:unused:exports`
  - `ts-prune` scan for exports that appear unused.
- `audit:unused:deps`
  - `depcheck` scan for potentially unused dependencies.
- `audit:unused`
  - Runs all three checks in sequence.

## Notes

- `ts-prune` and `depcheck` are invoked via `npx --yes`.
- Expect some false positives (dynamic imports, test-only usage, i18n/file-based conventions).
- Removal work should happen in small follow-up commits grouped by folder/feature.
