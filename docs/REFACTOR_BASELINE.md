# Refactor Baseline (Step 1)

Date: 2026-02-26

## Goal
Freeze current behavior before structural refactors:
- establish reproducible baseline test status
- define critical smoke flow command for quick regression checks

## Baseline test run
Command:

```bash
npm run test:run
```

Result:
- Test Files: 5 passed (5)
- Tests: 45 passed | 9 skipped (54)
- Duration: ~135s

Note:
- Known warning in app pagination test (non-failing):
  - MUI `anchorEl` invalid warning in jsdom while interacting with select popover.

## Smoke suite command
Added:

```bash
npm run test:smoke:home
```

It runs critical home workflows:
- initial render shell
- folder CRUD row actions
- new item highlight behavior
- list pagination behavior
- move selected content behavior

## Scope boundary for next steps
No runtime behavior changes were introduced in this step.
