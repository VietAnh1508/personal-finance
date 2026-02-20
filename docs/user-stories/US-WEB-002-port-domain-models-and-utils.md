# US-WEB-002: Port Domain Models and Shared Utilities

## User Story
As a developer,
I want to reuse existing domain and utility logic in the web app,
so that financial rules remain consistent across migration.

## Acceptance Criteria
1. Currency, transaction-type, and wallet domain model modules are ported to web codebase.
2. Shared money/date utility functions are ported with behavior parity.
3. Domain logic has no React Native or Expo runtime dependency.
4. Existing unit tests for migrated domain logic run in web test environment.
5. Core invariants are preserved (integer minor units, ISO date format, transfer pairing rules).
