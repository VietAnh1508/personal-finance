# React PWA Migration Plan

## 1. Goal and Decision

Convert the current Expo React Native app to a React SPA + PWA with:

- Local-first offline support
- Background sync to backend
- Postgres as server database
- Feature parity for current MVP flows

Decision: migrate in phases and reuse domain/business logic where possible. Do not rebuild everything from scratch.

Frozen-but-pending features from `docs/PROGRESS.md` (US-010, US-012, US-013, US-014) are in scope for the web backlog and must be delivered in the PWA track before final decommission of RN/Expo.

---

## 2. Target Architecture

### Frontend

- React SPA (Vite + TypeScript)
- React Router
- Tailwind CSS for UI
- IndexedDB via Dexie (local database)
- PWA via service worker + manifest (`vite-plugin-pwa`)

### Backend

- Node.js API (Express/Nest/Fastify acceptable)
- Postgres as source of truth
- Sync endpoints for push/pull model

### Data Flow

1. User action writes to local DB first (offline-safe).
2. Action is recorded in `outbox`.
3. Sync worker pushes outbox to backend when online.
4. Client pulls remote updates since last sync marker.
5. Local DB is updated and UI re-renders.

---

## 3. Current Codebase Assessment (What to Keep)

The existing project already has strong separation between UI and business rules.

### Keep and migrate with minimal changes

- `src/domain/*` (currency rules, transaction types, wallet icon mappings)
- `src/domain/services/*` (validation and business logic)
- `src/utils/*` (money/date formatting + parsing logic)
- Product and behavior docs in `docs/*`

### Rewrite/replace

- `src/screens/*` (React Native UI -> React DOM UI)
- `src/components/*` that depend on React Native primitives
- Expo Router routes in `app/*` -> React Router routes
- SQLite data implementation in `src/data/database/*`
- Repositories in `src/data/repositories/*` to use Dexie instead of Expo SQLite

### Remove from web app

- Expo runtime and RN-only setup (`app.json`, Expo entry assumptions, RN platform-only utilities)
- `expo-sqlite`, `react-native`, `react-native-web`, `@react-native-community/datetimepicker`, and other native-only dependencies no longer needed by SPA

---

## 4. Migration Phases

## Phase 0: Preparation and Scope Freeze

1. Freeze MVP scope using `docs/PROGRESS.md` and current user stories.
2. Confirm behavior rules from `docs/TECHNICAL_ARCHITECTURE.md`.
3. Define parity checklist for each existing feature flow.

Deliverable: approved migration scope and parity checklist.

## Phase 1: Bootstrap Web App

1. Create `web/` app (Vite + React + TypeScript).
2. Add Tailwind CSS.
3. Add base tooling: ESLint, typecheck, tests.
4. Add route shell for:
   - onboarding currency setup
   - first wallet
   - transactions list
   - add transaction
   - transfer
   - adjustment
   - transaction detail
   - settings/wallets

Deliverable: web skeleton builds and routes navigate.

## Phase 2: Domain and Utility Port

1. Copy/migrate `src/domain/*` and `src/utils/*` into shared or web app module.
2. Remove React Native dependencies from domain boundaries.
3. Keep function signatures stable where possible.
4. Port unit tests for domain/service logic.

Deliverable: core business logic passing tests in web project.

## Phase 3: Local Database and Repository Migration

1. Design Dexie schema mirroring current entities:
   - `wallets`
   - `transactions`
   - `user_preferences`
   - `app_state`
   - `outbox` (new for sync)
2. Implement Dexie database module.
3. Rebuild repository layer to preserve service contracts.
4. Validate CRUD parity with existing app behavior.

Deliverable: app runs fully offline with local data persistence.

## Phase 4: UI Migration to React + Tailwind

1. Rebuild screens with React DOM + Tailwind.
2. Replace RN components (`View`, `Text`, `Pressable`, `Modal`, etc.) with semantic HTML + accessible patterns.
3. Replace mobile `Alert` flows with web confirm dialog/modal.
4. Implement reusable web UI primitives:
   - buttons
   - form fields
   - dialogs
   - toast notifications

Deliverable: UI feature parity for all currently completed stories.

## Phase 5: Date Picker Strategy

For MVP and speed:

1. Use native `<input type="date">` styled via Tailwind.
2. Keep date format conversion logic in utilities (`YYYY-MM-DD` storage).
3. If custom calendar is needed later, introduce `react-day-picker`.

Deliverable: date selection works consistently across major browsers.

## Phase 6: Backend + Postgres + Sync

1. Implement backend tables matching domain model.
2. Define sync API:
   - push operations (from outbox)
   - pull changes since `lastSyncedAt` or version cursor
3. Add deterministic conflict strategy (start with last-write-wins).
4. Add retry and idempotency for outbox replay.

Deliverable: local-first app synchronizes reliably when online.

## Phase 7: PWA Enablement

1. Add `manifest.webmanifest` and app icons.
2. Configure service worker:
   - app shell precache
   - runtime caching strategy
3. Ensure installability and offline launch.
4. Add update flow (new version available prompt).

Deliverable: installable PWA with offline app shell and local data.

## Phase 8: Hardening and Cutover

1. Regression tests for critical finance flows.
2. Offline/online transition tests.
3. Performance checks on large local datasets.
4. Launch readiness checklist and staged rollout.
5. Validate completion of carried-forward feature set:
   - category management
   - reports summary
   - future-dated transaction rules
   - currency change no-conversion warning

Deliverable: production-ready React PWA replacement.

## Phase 9: React Native/Expo Decommission

1. Execute final PWA parity sign-off and production cutover checklist.
2. Remove or archive React Native/Expo app entry points and mobile-only scripts.
3. Remove RN/Expo-only dependencies from active manifests and lockfiles.
4. Update CI/CD pipelines and documentation to web/PWA as the default client.
5. Document rollback and legacy app deprecation plan.

Deliverable: PWA-only codebase and delivery pipeline.

---

## 5. Tailwind Usage Guidance

Yes, Tailwind can be used for most components, including forms and layout.

Recommended approach:

1. Use Tailwind for 80-90% of component styling.
2. Add a small set of reusable app primitives (`Button`, `Input`, `Modal`, `Card`) to keep consistency.
3. Use native date input first; avoid heavy date picker libraries early.

---

## 6. Risks and Mitigations

1. Risk: behavior regressions during UI rewrite.
   - Mitigation: service-layer parity tests + feature checklists.
2. Risk: sync conflicts and duplicate writes.
   - Mitigation: outbox idempotency keys + deterministic conflict policy.
3. Risk: offline assumptions not validated early.
   - Mitigation: test offline mode from Phase 3 onward, not at the end.

---

## 7. Suggested Execution Order (Sprint-Friendly)

1. Phase 0-1: project scaffold + routes + tooling.
2. Phase 2-3: domain reuse + Dexie repositories.
3. Phase 4-5: UI migration with Tailwind + date handling.
4. Phase 6: backend + sync.
5. Phase 7-8: PWA hardening + launch.
6. Phase 9: decommission RN/Expo and finalize PWA-only operations.

This order minimizes rewrite risk and gets offline capability early.
