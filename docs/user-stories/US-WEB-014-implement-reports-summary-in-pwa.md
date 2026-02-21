# US-WEB-014: Implement Reports Summary in PWA

## User Story
As a user,
I want a reports summary view in the web app,
so that I can understand spending and income trends over time.

## Acceptance Criteria
1. Reports support period filters for month, year, and custom date range.
2. Reports support wallet filter: `All Wallets` and individual wallet selection.
3. Reports include summary metrics for total income, total expense, and net income.
4. Transfer and adjustment transactions are excluded from income/expense totals.
5. Future-dated transactions are included when they fall inside the selected report range.
6. Reports render correctly from local-first data while offline and update after create/edit/delete or sync reconciliation.
