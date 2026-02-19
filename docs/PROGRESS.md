# Progress Tracker

## Status Legend
- [ ] Not started
- [-] In progress
- [x] Done
- [!] Blocked

## Current Focus
- Define and deliver MVP stories in order.

## User Stories
- [x] US-000 Setup Expo project
- [x] US-001 Select currency on first launch
- [x] US-002 Create first wallet
- [x] US-003 Transactions top bar context
- [x] US-004 Switch wallet context
- [x] US-005 Add income/expense
- [ ] US-006 Wallet preselection across add screens
- [ ] US-007 Create transfer
- [ ] US-008 Create adjustment
- [ ] US-009 Edit/delete transactions
- [ ] US-010 Manage categories
- [x] US-011 Manage wallets with archiving
- [ ] US-012 Reports summary
- [ ] US-013 Future-dated transaction rules
- [ ] US-014 Currency change no-conversion warning
- [x] US-015 Action feedback with toast notifications
- [x] US-016 Group transactions by date on Transactions screen

## Notes
- Update status as each story starts/completes.
- Add implementation links or PR references under each story as needed.
- Package manager standard: use `pnpm` for all dependency management and scripts.
- Temporary dev-only reset flow exists for onboarding tests; track removal before release:
  - `app/(tabs)/settings.tsx` (`Reset local data (dev)` action)
  - `src/domain/services/app-maintenance-service.ts`
  - `src/data/repositories/app-data-repository.ts`
  - `src/data/database/index.ts` (`clearAppData`)
