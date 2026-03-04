# US-WEB-009: Implement Backend Sync Integration (Outbox Push/Pull)

## User Story
As a user,
I want local offline changes to sync to the backend when online,
so that my data is backed up and consistent across devices and sessions.

## Prerequisites
- US-WEB-022: Backend API service must be set up (Hono + Drizzle + Neon + Clerk).
- User must be authenticated via Clerk before sync is attempted.

## Sync Architecture

The PWA uses an **outbox pattern** for offline-first sync:

1. Every local write (create/update/delete on wallets and transactions) enqueues an operation in the local Dexie `outbox` table.
2. A `SyncService` runs when the app comes online and flushes pending outbox entries to the backend.
3. On first load or new device, the client pulls the full remote state and hydrates the local Dexie database.

```
IndexedDB (Dexie) ← primary read/write
       ↓ outbox flush (push)
  Backend API (Hono)
       ↓
  Neon Postgres ← remote source of truth
```

## API Contract

### Push outbox operations
```
POST /sync/push
Authorization: Bearer <clerk-session-token>

Body: {
  operations: Array<{
    id: string           // outbox entry id (idempotency key)
    operationType: 'CREATE' | 'UPDATE' | 'DELETE'
    entityType: 'WALLET' | 'TRANSACTION' | 'USER_PREFERENCE'
    entityId: string
    payload: unknown     // full entity snapshot for CREATE/UPDATE; empty for DELETE
  }>
}

Response: { processed: string[] }  // ids of successfully applied operations
```

### Pull remote state
```
GET /sync/pull
Authorization: Bearer <clerk-session-token>

Response: {
  wallets: WalletRow[]
  transactions: TransactionRow[]
  userPreference: UserPreferenceRow | null
}
```

## Acceptance Criteria
1. Every local write (wallet create/update/archive, transaction insert/update/delete) enqueues a corresponding operation in the Dexie `outbox` table.
2. `SyncService` detects online status and flushes pending outbox operations to `POST /sync/push`; operations are applied idempotently on the backend using the outbox `id` as the idempotency key.
3. On app load with an authenticated user, the client calls `GET /sync/pull` and hydrates local Dexie tables with remote state (wallets, transactions, user preference).
4. Sync runs in the background; local reads and writes are never blocked by sync status.
5. Failed sync operations are retried on next online event; persistent failures surface a non-blocking error toast.
6. `app_state` (last selected wallet context) is local-only and never synced.

## Notes
- The Dexie `outbox` table and `enqueueOperation` infrastructure already exist (US-WEB-003); this story wires them to the backend.
- The `SyncService` lives in `web/src/data/sync/` and is independent of React; it is triggered from the app shell on connectivity events.
- Conflict resolution strategy: last-write-wins based on `updatedAt` timestamp. Remote wins on pull; local wins on push (optimistic).
- Transfer pairs (two transactions sharing a `transferId`) must be pushed and pulled as a pair to maintain consistency.
