# US-005: Add Income/Expense From Center Add Button

## User Story
As a user,
I want the center Add button to open a fast income/expense entry screen,
so that common transaction entry is quick.

## Acceptance Criteria
1. Center Add button opens `AddTransactionScreen` for Income/Expense only.
2. Form includes: wallet, amount, category, date, optional note.
3. Amount must be positive.
4. Save creates a transaction with type `income` or `expense`.
5. On success, app returns and updates transaction list and totals.
