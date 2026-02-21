# US-WEB-015: Implement Future-Dated Transaction Rules in PWA

## User Story
As a user,
I want consistent rules for future-dated transactions in the web app,
so that planning entries do not produce incorrect balance behavior.

## Acceptance Criteria
1. Future-dated transactions are allowed across income, expense, transfer, and adjustment flows.
2. Transactions view balance excludes transactions with date after today (today based on local device date).
3. Reports include future-dated transactions when the selected report range includes them.
4. Transaction list grouping and ordering correctly include future-dated entries without breaking edit/delete behavior.
5. Rule behavior is covered by automated tests for service and UI integration paths.
