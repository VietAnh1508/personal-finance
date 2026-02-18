# US-002: Create First Wallet

## User Story
As a user,
I want to create my first wallet with an initial balance,
so that I can start tracking transactions.

## Acceptance Criteria
1. If no wallet exists after currency setup, user is prompted to create a wallet.
2. Wallet form includes at least: wallet name and initial balance.
3. New wallet is created as active (not archived).
4. After save, app navigates to Transactions tab scoped to the new wallet.
5. Initial balance input displays grouped thousands separators for readability (e.g., `1,000,000`).
6. Wallet form includes predefined wallet icon options for the user to select.
