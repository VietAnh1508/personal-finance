# US-WEB-020: Port Transactions Header Actions Menu

## User Story
As a user,
I want transfer and adjustment actions in the transactions header menu,
so that the main transactions screen matches the app-style top bar interaction.

## Acceptance Criteria
1. Transactions top bar right side includes an actions menu trigger (icon-only button) aligned with RN behavior.
2. Actions menu includes exactly two actions: `Transfer` and `Adjust balance`.
3. Choosing `Transfer` navigates to `/transactions/transfer` and preserves existing validation for minimum active wallets.
4. Choosing `Adjust balance` navigates to `/transactions/adjustment`.
5. Existing bottom inline `Transfer` and `Adjustment` buttons are removed from transactions page.
6. Actions menu is touch-friendly and accessible (button semantics, labels, focus handling, and dismiss behavior).
