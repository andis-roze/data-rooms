# Coverage Plan

Date: 2026-02-26

## Baseline and Constraints
- Current configured thresholds in `vite.config.ts`: statements `60`, lines `60`, functions `60`.
- Coverage gate is enforced in pre-push via `scripts/verify-pre-push.mjs` (line coverage check from `coverage/coverage-summary.json`).
- Known environment constraint: `npm run test:coverage -- --coverage.reporter=json-summary` is unstable here; on 2026-02-26 the run stalled after unit tests and app test startup and did not produce `coverage/coverage-summary.json`.
- Practical baseline for day-to-day work in this environment: use `npm run test:run` + targeted test files for fast validation, then run full coverage in a stable environment before raising gates.

## Priority Areas (Risk-First)
1. `src/features/home/hooks`:
   - High behavior risk (selection, move/delete workflows, sorting, feedback queue state transitions).
2. `src/features/home/selectors` and `src/features/home/model`:
   - Pure logic drives visible ordering/filtering and view model behavior.
3. `src/features/dataroom/model/mutations` and delete-analysis helpers:
   - Core data integrity paths; regressions can corrupt tree state.
4. `src/features/home/components/content` critical controls:
   - Pagination, destructive dialogs, and action bars are user-facing failure points.
5. `src/i18n/config.ts` and router/provider edges:
   - Lower volume, but bootstrap regressions can break app startup.

## Atomic Commit Plan
1. `test(home-hooks): add unit tests for useMoveContentWorkflow + useDeleteSelectedContent`
   - Cover success, blocked-state, and cancel flows with minimal mocked dependencies.
2. `test(home-hooks): add unit tests for useContentSelection + useSortActions`
   - Cover toggle/select-all and sort direction/key transitions.
3. `test(home-selectors): add selector and view-model tests`
   - Cover empty, nested, and mixed folder/file ordering cases.
4. `test(dataroom-mutations): expand mutation edge-case coverage`
   - Cover rename collisions, move into invalid targets, and delete target calculation boundaries.
5. `test(home-components): add focused tests for pagination and destructive dialogs`
   - Cover rows-per-page change, page reset behavior, and delete confirmation gating.
6. `test(app-smoke): harden high-value integration assertions`
   - Keep smoke scope stable; add assertions around existing critical flows only.
7. `chore(coverage): collect stable coverage snapshot and document exclusions (if any)`
   - Run full coverage in stable environment; keep exclusions explicit and minimal.
8. `chore(coverage): raise thresholds incrementally`
   - Raise to `65/65/65`, then `70/70/70` after two consecutive stable passes.

## Threshold-Raising Strategy
- Stage 1: hold `60` until commits 1-6 land and pass `npm run test:run` consistently.
- Stage 2: in stable runner, verify full coverage twice; raise to `65` for statements/lines/functions.
- Stage 3: after next test tranche (remaining home components + bootstrap edges), verify twice again; raise to `70`.
- Rule: never raise thresholds in same commit that introduces large refactors; keep threshold bumps isolated.

## Execution Notes
- Keep each commit scoped to one test target group and avoid production code edits.
- If coverage run instability persists locally, use stable environment (CI/container) as the source of truth for gate-raising decisions.
