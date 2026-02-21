# US-WEB-016: Implement Currency Change No-Conversion Warning in PWA

## User Story
As a user,
I want a clear warning when changing app currency without conversion,
so that I understand existing amounts are relabeled and not recalculated.

## Acceptance Criteria
1. Currency setting is global and applies across all wallets and relevant views.
2. Currency options are constrained to predefined values: `USD` and `VND`.
3. Changing currency from settings presents an explicit no-conversion warning before confirmation.
4. Warning copy clearly states historical amounts are not converted, only display currency formatting changes.
5. User must explicitly confirm to proceed, with cancel path preserving current currency.
6. After change, only symbol/format updates; stored monetary values remain unchanged.
7. Behavior is covered by tests for confirmation flow and formatting updates.
