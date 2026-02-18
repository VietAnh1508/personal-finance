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
