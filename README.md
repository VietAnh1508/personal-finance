# Personal Finance (Expo + TypeScript)

Offline-first personal finance app for iOS built with Expo and React Native.

## Package Manager

Use `pnpm` only.

```bash
pnpm install
```

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Run quality checks:

```bash
pnpm check
```

3. Start Expo:

```bash
pnpm start
```

## iOS Dev Client Workflow

1. Build and install the iOS development client:

```bash
pnpm expo run:ios
```

2. Start Metro for the dev client:

```bash
pnpm start -- --dev-client
```

3. Open the installed app in iOS Simulator/device and connect to Metro.

## Useful Commands

```bash
pnpm lint
pnpm typecheck
pnpm ios
pnpm web
```

## Currency Display Setup

- Supported currencies are defined in `src/domain/currency.ts` via `CURRENCY_OPTIONS`.
- Each currency includes `symbol` and `fractionDigits` metadata used by UI formatting.
- Balance/amount screens should use domain helpers instead of hardcoded currency checks:
  - `getCurrencySymbol(code)`
  - `getCurrencyFractionDigits(code)`

### Add a New Currency

1. Add a new entry in `CURRENCY_OPTIONS` with:
   - `code`
   - `label`
   - `symbol`
   - `fractionDigits`
2. Ensure the code is selectable where currency preferences are set.
3. Do not add screen-level `if (currency === ...)` logic for formatting; rely on metadata helpers.

## Local Data Reset (Dev)

- In development builds, open `Settings` and tap `Reset local data (dev)`.
- This clears local SQLite data for wallets and currency preference, then routes back to onboarding flow.

## Temporary Dev-Only Additions

- Purpose: testing first-launch and onboarding flows repeatedly during early stories.
- Remove when: we ship production-ready Settings management for wallets/currency (or before release build hardening).
- Files/components tied to this temporary flow:
  - `app/(tabs)/settings.tsx` (`Reset local data (dev)` button guarded by `__DEV__`)
  - `src/domain/services/app-maintenance-service.ts`
  - `src/data/repositories/app-data-repository.ts`
  - `src/data/database/index.ts` (`clearAppData` function)
