# US-008: Create Balance Adjustment From Top-Right Menu

## User Story
As a user,
I want to record adjustment transactions from the top-right actions menu,
so that I can reconcile app balance with real balance.

## Acceptance Criteria
1. Selecting `Adjust balance` opens `AddAdjustmentScreen`.
2. Form includes: wallet, amount, date, optional note.
3. User can choose increase or decrease direction; amount must be non-zero.
4. Save creates transaction with type `adjustment`.
5. Adjustment affects wallet balance and appears in transaction list.
