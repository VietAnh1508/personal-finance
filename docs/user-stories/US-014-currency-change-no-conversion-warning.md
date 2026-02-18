# US-014: Change Currency With No-Conversion Warning

## User Story
As a user,
I want to change app currency safely from Settings,
so that I understand display changes do not alter stored values.

## Acceptance Criteria
1. Currency setting is global and applies to all wallets.
2. Currency selection is predefined list only: `USD`, `VND`.
3. App shows explicit warning before confirming currency change that amounts are not converted.
4. After change, only symbol/format updates; stored monetary values are unchanged.
