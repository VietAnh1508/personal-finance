# US-016: Group Transactions by Date on Transactions Screen

## User Story
As a user,
I want transactions grouped by date,
so that I can scan my daily activity and totals more easily.

## Acceptance Criteria
1. Transactions are rendered in date sections (one section per calendar date in local device time).
2. Each section header shows:
   - Day number (e.g., `28`)
   - Weekday + month/year label (e.g., `Monday`, `June 2021`)
   - Daily net total for that date (income minus expense, including other balance-affecting transaction types).
3. Date sections are sorted newest date first.
4. Transactions inside each date section are sorted newest first.
5. In `All Wallets` context, section grouping is based on the transaction date and includes only active wallets.
6. Switching wallet context updates grouped sections and daily totals to match the selected scope.
7. Existing transaction row interactions remain unchanged (tap to open detail/edit).
