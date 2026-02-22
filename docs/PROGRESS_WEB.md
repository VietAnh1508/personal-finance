# Web Migration Progress Tracker

## Status Legend
- [ ] Not started
- [-] In progress
- [x] Done
- [!] Blocked

## Current Focus
- Establish React SPA + PWA migration foundation and track parity against current mobile MVP.

## Web Migration User Stories
- [x] US-WEB-000 Set up React SPA baseline (Vite + TypeScript + Tailwind)
- [x] US-WEB-001 Set up routing shell for migration flows
- [x] US-WEB-002 Port domain models and shared utilities
- [x] US-WEB-003 Implement local-first data layer with Dexie
- [x] US-WEB-004 Port wallet setup and currency onboarding flows
- [x] US-WEB-005 Port transactions list and wallet context behavior
- [x] US-WEB-006 Port add income/expense flow (web form + date input)
- [x] US-WEB-007 Port transfer and adjustment flows
- [x] US-WEB-008 Port transaction detail edit/delete flow
- [ ] US-WEB-009 Implement backend sync API integration (outbox push/pull)
- [x] US-WEB-010 Enable PWA installability and offline app shell
- [ ] US-WEB-011 Set up web test infrastructure and migration parity checks
- [ ] US-WEB-012 Decommission React Native/Expo app and make PWA the only client
- [ ] US-WEB-013 Implement category management in PWA
- [ ] US-WEB-014 Implement reports summary in PWA
- [ ] US-WEB-015 Implement future-dated transaction rules in PWA
- [ ] US-WEB-016 Implement currency change no-conversion warning in PWA
- [x] US-WEB-017 Port settings wallet management flow
- [-] US-WEB-018 Implement action feedback toast notifications
- [x] US-WEB-019 Port mobile footer tab navigation
- [x] US-WEB-020 Port transactions header actions menu

## Notes
- Existing `docs/PROGRESS.md` remains the historical RN/Expo MVP tracker.
- Web migration stories are tracked separately to avoid mixing delivery contexts.
- Use `US-WEB-*` prefix for all migration stories under `docs/user-stories/`.
- `US-WEB-000` scaffolded under `web/` with Vite + React + TypeScript + Tailwind, plus lint/typecheck/test scripts and setup guide.
- `US-WEB-003` completed with Dexie-backed IndexedDB schema (`wallets`, `transactions`, `user_preferences`, `app_state`, `outbox`), repository CRUD layer, and passing web tests.
- `US-WEB-006` completed with a production route for add income/expense, wallet-context preselection, positive minor-unit amount validation, and persistence verified by integration tests.
- `US-WEB-007` completed with transfer and adjustment forms, wallet-context preselection, active-wallet/same-wallet transfer validation, paired transfer creation with shared transfer id, UI guard blocking transfers from source wallets with current balance `<= 0`, and green service + page integration tests.
- `US-WEB-008` completed with transaction detail edit/delete UI for income/expense, transfer, and adjustment types; transfer pair-safe edit/delete domain logic; confirmation before delete; and toast success/error feedback coverage for update/delete actions.
- Frozen RN backlog from `docs/PROGRESS.md` is mapped to: `US-WEB-013` (US-010), `US-WEB-014` (US-012), `US-WEB-015` (US-013), `US-WEB-016` (US-014).
- Additional parity carry-forward: `US-WEB-017` maps to completed RN story `US-011` (wallet management in Settings).
- Additional parity carry-forward: `US-WEB-018` maps to completed RN story `US-015` (action feedback toast notifications).
- Additional parity carry-forward: `US-WEB-019` covers RN tab footer behavior currently defined in `app/(tabs)/_layout.tsx` (Transactions, center Add action, Settings) and removes route-shell top link navigation in app area.
- Additional parity carry-forward: `US-WEB-020` covers RN transactions top-right actions menu behavior from `app/(tabs)/index.tsx` (`Transfer`, `Adjust balance`).
- Web import convention: for internal web app modules under `web/src`, prefer alias imports using `@/...` instead of relative traversal (`../` or `../../`).
- Follow-up dependency: when implementing `US-WEB-008` (transaction update/delete flow), add toast success/error coverage for edit/delete actions there; and when `US-WEB-017` ships wallet update UI/actions on web, add toast success/error coverage for wallet update to fully close `US-WEB-018` acceptance criterion #3.
- `US-WEB-017` completed with web wallet settings UI for create/edit/archive, archived visibility toggle, and transfer endpoint filtering tests for archived wallet exclusion.
- `US-WEB-010` completed with manifest metadata/icons, service worker app-shell caching with navigation fallback, install prompt UI wiring, and service-worker update activation flow with tests.
- `US-WEB-020` completed with a transactions top-right actions menu (`Transfer`, `Adjust balance`), transfer minimum-wallet guard before navigation, menu dismiss behavior, and removal of inline transfer/adjustment buttons from transactions page.
- `US-WEB-019` completed with a mobile-first bottom footer tab bar for app main routes (`/transactions`, `/settings`), a visually emphasized center `Add` action routing to `/transactions/add`, active tab highlighting, and removal of the prior app-area top link navigation.
