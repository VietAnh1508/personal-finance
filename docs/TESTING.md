# Testing Guide

This project uses Jest with `jest-expo` and React Native Testing Library.

## Run Tests

```bash
pnpm test
```

Watch mode:

```bash
pnpm test:watch
```

## Test Structure

- Unit tests: colocated with source files as `*.test.ts`.
- Component/integration tests: colocated as `*.test.tsx`.

Current examples:

- `src/utils/date-format.test.ts` (unit)
- `src/components/ui/segmented-toggle.test.tsx` (component interaction)

## Shared Setup

- Jest config: `jest.config.js`
- Global setup: `jest.setup.ts`

The setup file enables:

- React Native Testing Library built-in matchers
- React Native Gesture Handler test setup
- Reanimated and NativeAnimated helper mocks for stable RN test execution
