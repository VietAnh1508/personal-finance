# US-WEB-009: Implement Backend Sync API Integration (Outbox Push/Pull)

## User Story
As a user,
I want local offline changes to sync to backend when online,
so that my data can be backed up and shared across sessions/devices.

## Acceptance Criteria
1. Local writes append deterministic operations to outbox.
2. Sync worker pushes outbox operations to backend with idempotency safeguards.
3. Client can pull remote changes since last sync marker.
4. Sync process updates local DB without breaking local-first UX.
5. Sync errors are retried and surfaced through non-blocking feedback.
