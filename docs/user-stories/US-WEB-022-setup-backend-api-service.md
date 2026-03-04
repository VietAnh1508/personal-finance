# US-WEB-022: Set Up Backend API Service (Hono + Drizzle + Neon + Clerk)

## User Story
As a developer,
I want a backend API service initialized with Hono, Drizzle ORM, Neon Postgres, and Clerk authentication,
so that the PWA has a secure, typed backend ready to handle sync operations.

## Tech Stack
- **Runtime/Framework**: Hono (TypeScript-first, lightweight, works on Cloudflare Workers or Node)
- **Database**: Neon (serverless Postgres)
- **ORM**: Drizzle ORM with `@neondatabase/serverless` driver
- **Auth**: Clerk (JWT verification middleware; frontend uses `@clerk/clerk-react`)

## Acceptance Criteria
1. A Hono-based API project exists under `api/` in the monorepo root.
2. Neon database connection is configured via `DATABASE_URL` environment variable using `@neondatabase/serverless` + Drizzle.
3. Drizzle schema mirrors the Dexie local schema with a `userId` column on all user-owned tables: `wallets`, `transactions`, `user_preferences`.
4. Drizzle migrations are applied and verifiable against the Neon database.
5. Clerk JWT verification middleware is configured; all non-health routes require a valid Clerk session token.
6. A `GET /health` endpoint returns `200 OK` without auth, confirming the service is reachable.
7. Environment variable requirements are documented (`.env.example` provided).
8. Local dev setup instructions are documented.

## Notes
- The `api/` project sits alongside `web/` in the monorepo; no shared runtime dependencies between them.
- Authorization is handled at the application layer: each handler extracts `userId` from the verified Clerk JWT and scopes all DB queries with `WHERE user_id = $userId`. No RLS.
- `app_state` is local-only (stores last selected wallet context); it is not synced and has no remote table.
- This story is a prerequisite for US-WEB-009 (sync integration).
