# US-WEB-019: Port Mobile Footer Tab Navigation

## User Story
As a user,
I want a persistent mobile footer tab bar in the PWA,
so that I can quickly switch between Transactions and Settings and access Add from the center action.

## Acceptance Criteria
1. App area uses a mobile-first bottom tab footer instead of the current top link navigation.
2. Footer includes three actions aligned with RN parity: `Transactions`, centered `Add`, and `Settings`.
3. Center `Add` action navigates to income/expense add flow (`/transactions/add`) and is visually emphasized as the primary action.
4. Footer remains visible for main app routes (`/transactions`, `/settings`) and does not appear on onboarding routes.
5. Active tab state is visually indicated based on current route.
6. Footer interaction is touch-friendly and accessible (button/link semantics, labels, and keyboard focus support).

## Out of Scope
- Transfer and adjustment entry points in transactions top bar actions menu (tracked in `US-WEB-020`).
