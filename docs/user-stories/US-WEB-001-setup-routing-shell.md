# US-WEB-001: Set Up Routing Shell for Migration Flows

## User Story
As a developer,
I want a route structure matching key product flows,
so that migrated features can be delivered incrementally with predictable navigation.

## Acceptance Criteria
1. React Router is configured for SPA navigation.
2. Route placeholders exist for onboarding, wallet setup, transactions, add flows, and settings.
3. Unknown routes are handled by a Not Found page.
4. Route-level layout supports future authenticated and unauthenticated flows.
5. Navigation can reach each placeholder route without runtime errors.
