# US-001: Select Currency On First Launch

## User Story
As a user,
I want to choose my app currency when I open the app for the first time,
so that all amounts are displayed in my preferred currency format.

## Acceptance Criteria
1. On first launch with no saved preference, the app shows `CurrencySetupScreen` before wallet creation.
2. Currency choices are predefined only: `USD` and `VND`.
3. Manual text input for currency is not available.
4. Selected currency is saved as a global app preference.
5. After selection, user proceeds to first wallet creation flow.
