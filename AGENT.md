# AGENT.md

## Project Context
This repository contains an offline-first personal finance mobile app (React Native + Expo + TypeScript).
Primary planning docs:
- `docs/PRODUCT_PLAN.md`
- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/user-stories/`
- `docs/PROGRESS.md`

Treat `docs/PRODUCT_PLAN.md` as product source of truth.

## Current Product Decisions (MVP)
1. MVP platform focus is iOS (built with React Native/Expo).
2. Ledger-based model: balances are derived from transactions.
3. Transaction types: `income`, `expense`, `transfer`, `adjustment`.
4. Transfer creates two linked transactions (`transfer_out`, `transfer_in`) with shared `transferId`.
5. Currency is global user preference (not per-wallet), predefined options only: `USD`, `VND`.
6. Changing currency updates symbol/format only; no amount conversion.
7. Transactions top bar:
   - Left: wallet selector (icon trigger)
   - Center: total for selected context
   - Right: menu actions (`Transfer`, `Adjust balance`)
8. Center Add button opens Income/Expense flow only.
9. Date convention:
   - Persist as ISO `YYYY-MM-DD`
   - Display as `DD/MM/YYYY` in UI

## Planning & Delivery Workflow
1. Read the relevant user story file in `docs/user-stories/` before coding.
2. Update `docs/PROGRESS.md` status when starting/completing a story.
3. Keep implementation aligned with both product and technical docs.
4. If docs conflict, do not guess silently:
   - prefer product plan intent,
   - propose doc updates,
   - then implement.

## Engineering Guidelines
0. Use `pnpm` as the package manager for all install/run workflows in this repository.
1. Keep business logic in domain/services, not UI components.
2. Money values must use integer smallest units only (no float math).
3. Keep transfer operations atomic/consistent (both sides update/delete together).
4. Future-dated behavior:
   - excluded from current balance
   - included in reports only when date range includes them.
5. Reports include only income/expense totals; exclude transfer/adjustment.
6. Prefer small, testable changes scoped to one story at a time.
7. Search and reuse existing code before creating new abstractions; avoid duplicate implementations.
8. Keep component files small and focused; ideally one component per file.
9. Avoid premature optimization hooks (`useMemo`, `useCallback`, `memo`); only use them when there is a measured performance issue or clear referential-stability requirement.
10. When running shell commands against paths containing parentheses (for example `app/(tabs)/index.tsx`), quote the path (for example `'app/(tabs)/index.tsx'`) to avoid zsh globbing errors.

## Code Change Rules
1. Do not introduce unrelated refactors while implementing a story.
2. Preserve existing behavior unless story explicitly changes it.
3. Add/adjust tests for business-critical logic changes.
4. Keep naming consistent with docs and domain terms.

## Definition of Done (per story)
- Story acceptance criteria are satisfied.
- Code compiles and relevant tests pass.
- `docs/PROGRESS.md` updated.
- Any needed doc clarifications are committed with the change.
