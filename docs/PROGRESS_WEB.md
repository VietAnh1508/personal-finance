# Web Migration Progress Tracker

## Status Legend
- [ ] Not started
- [-] In progress
- [x] Done
- [!] Blocked

## Current Focus
- Establish React SPA + PWA migration foundation and track parity against current mobile MVP.

## Web Migration User Stories
- [ ] US-WEB-000 Set up React SPA baseline (Vite + TypeScript + Tailwind)
- [ ] US-WEB-001 Set up routing shell for migration flows
- [ ] US-WEB-002 Port domain models and shared utilities
- [ ] US-WEB-003 Implement local-first data layer with Dexie
- [ ] US-WEB-004 Port wallet setup and currency onboarding flows
- [ ] US-WEB-005 Port transactions list and wallet context behavior
- [ ] US-WEB-006 Port add income/expense flow (web form + date input)
- [ ] US-WEB-007 Port transfer and adjustment flows
- [ ] US-WEB-008 Port transaction detail edit/delete flow
- [ ] US-WEB-009 Implement backend sync API integration (outbox push/pull)
- [ ] US-WEB-010 Enable PWA installability and offline app shell
- [ ] US-WEB-011 Set up web test infrastructure and migration parity checks

## Notes
- Existing `docs/PROGRESS.md` remains the historical RN/Expo MVP tracker.
- Web migration stories are tracked separately to avoid mixing delivery contexts.
- Use `US-WEB-*` prefix for all migration stories under `docs/user-stories/`.
