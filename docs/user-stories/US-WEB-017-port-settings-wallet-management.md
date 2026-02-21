# US-WEB-017: Port Settings Wallet Management Flow

## User Story
As a user,
I want to manage wallets in Settings on the web app,
so that historical data stays consistent while I control active wallets.

## Acceptance Criteria
1. Settings includes wallet management for create, edit, and archive actions.
2. Archiving a wallet excludes it from `All Wallets` unified list and combined balance.
3. Archived wallets cannot be selected for transfer endpoints.
4. If the last used wallet becomes archived, app defaults to `All Wallets` on launch.
5. Wallet management view hides archived wallets by default and allows showing archived wallets.
