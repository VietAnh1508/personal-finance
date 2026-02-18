# US-006: Wallet Preselection Across Add Screens

## User Story
As a user,
I want wallet fields to prefill from current Transactions context,
so that I can enter data faster with fewer taps.

## Acceptance Criteria
1. If Transactions context is a specific wallet:
   - `AddTransactionScreen`: wallet is preselected.
   - `AddTransferScreen`: `From wallet` is preselected.
   - `AddAdjustmentScreen`: wallet is preselected.
2. If Transactions context is `All Wallets`:
   - wallet/`From wallet` starts empty in all add screens.
   - wallet/`From wallet` selection is required before save.
