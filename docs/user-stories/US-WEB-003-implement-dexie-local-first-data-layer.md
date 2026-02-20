# US-WEB-003: Implement Local-First Data Layer with Dexie

## User Story
As a user,
I want my financial data to be available offline in the web app,
so that I can use the app without internet connectivity.

## Acceptance Criteria
1. IndexedDB storage is implemented using Dexie.
2. Local schema includes wallets, transactions, user preferences, app state, and outbox.
3. Repository interfaces support CRUD operations required by domain services.
4. Data persists across browser refresh/restart.
5. App can perform core reads/writes while offline.
