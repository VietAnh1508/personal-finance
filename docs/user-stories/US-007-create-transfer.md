# US-007: Create Transfer From Top-Right Menu

## User Story
As a user,
I want to create transfers from the top-right actions menu,
so that I can move money between wallets.

## Acceptance Criteria
1. Selecting `Transfer` opens `AddTransferScreen`.
2. Transfer form includes: from wallet, to wallet, amount, date, optional note.
3. Amount must be positive.
4. `from wallet` and `to wallet` must be different.
5. Archived wallets cannot be selected for transfer endpoints.
6. Save creates two linked transactions (`transfer_out`, `transfer_in`) with shared `transferId`.
