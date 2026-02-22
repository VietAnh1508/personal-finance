# US-WEB-007: Port Transfer and Adjustment Flows

## User Story
As a user,
I want to create transfers and balance adjustments,
so that wallet balances stay accurate for internal moves and corrections.

## Acceptance Criteria
1. Transfer form supports from wallet, to wallet, amount, date, and optional note.
2. Transfer validation prevents same-wallet transfer and archived wallet usage.
3. Save creates paired transfer transactions with shared transfer id.
4. Adjustment form supports increase/decrease direction and validation.
5. Save updates totals and list according to existing balance rules.
6. UI blocks transfer initiation/submission when source wallet current balance is `0` or below.
