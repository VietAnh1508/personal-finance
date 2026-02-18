# Personal Finance iOS App – Project Plan

## 1. Project Goal
Build a simple, reliable, offline-first personal finance iOS app for managing multiple wallets, tracking transactions, handling transfers, and generating financial reports.

The app is intended for personal use only, with a focus on:
- Accuracy
- Simplicity
- Long-term maintainability
- Clean data structure

---

## 2. Core Features (MVP Scope)

### 2.1 Wallet Management
- User can create multiple wallets (e.g., Cash, Bank A, Bank B, Savings).
- User defines wallet name.
- User sets an initial balance when creating a wallet.
- User can edit or archive wallets (archive replaces delete; with safeguards if transactions exist).

Wallet balance logic:
- Each wallet has an initial balance.
- Current balance is calculated from:
  - Initial balance
  - All income transactions
  - All expense transactions
  - Transfers
  - Adjustment transactions

---

### 2.2 Transaction Management
- Record money in (income).
- Record money out (expense).
- Each transaction includes:
  - Wallet
  - Amount
  - Date
  - Category
  - Type: Income, Expense, Transfer, or Adjustment
  - Optional note
- User can edit and delete transactions.
- Transactions are displayed per wallet and optionally in a global list.

---

### 2.3 Category Management
- Predefined list of categories (e.g., Groceries, House renting, Transportation...).
- User can:
  - Add categories
  - Edit categories
  - Archive categories (instead of hard delete)
- Archived categories:
  - Remain linked to existing transactions (historical data stays intact)
  - Are hidden from default pickers/lists (unless user chooses to show archived)
  - Can optionally be restored (unarchived)

---

### 2.4 Transfers Between Wallets
- User selects:
  - From wallet
  - To wallet
  - Amount
  - Date
  - Optional note
- Transfers must:
  - Decrease balance from source wallet
  - Increase balance in destination wallet
- Transfer implementation:
  - Stored as two transactions (outgoing + incoming)
  - Both share a common **transfer id**
  - Editing one side updates the other side
  - Deleting one side deletes both
- Constraints:
  - Cannot transfer to/from an archived wallet

---

### 2.5 Reporting
Reports available for:
- Monthly
- Yearly
- Custom date range

Metrics:
- Total income
- Total expense
- Net income (income - expense)

Optional future expansion:
- Breakdown by category
- Wallet comparison
- Charts/graphs

---

## 3. Data Model (High-Level Concept)

Entities:
- Wallet
- Transaction
- Category
- Transfer linkage mechanism (shared transfer id between the two sides)

Transaction types:
- Income
- Expense
- Transfer (represented as two linked transactions)
- Adjustment (for balance reconciliation)

Design Principles:
- Ledger-based approach (transactions are source of truth).
- Avoid storing derived balances as primary truth.
- Store monetary values in smallest currency unit (e.g., cents).
- Transfers are represented as two transactions that share a common transfer id so edits/deletes can be applied consistently.
- Adjustments are separate transactions that affect balance but are excluded from income/expense reporting totals.
- Future-dated transactions are allowed and stored in the ledger.
  - Balance shown on the Transactions tab is calculated **up to today** (excludes future-dated transactions).
  - Reports include future-dated transactions when the selected date range includes them.

---

## 4. Non-Functional Requirements

### 4.1 Accuracy
- No floating point errors in money calculations.
- Reports must always match transaction data.
- Transfers must remain consistent (two sides updated/deleted together).

### 4.2 Offline-First
- Fully usable without internet.

### 4.3 Simplicity
- Minimal UI complexity.
- Fast transaction entry.

### 4.4 Data Safety
- Safe handling of deletions.
- Prefer archiving over destructive deletes.
- Basic backup/export capability (future milestone).

---

## 5. Phased Development Plan

### Phase 1 – Foundation
- First-run currency setup (global preference) before first wallet creation
- Wallet creation and listing
- Initial balance setup
- Transactions tab (single wallet + All Wallets option)
- Basic transaction (income/expense) recording
- Group transactions by day, sort latest-first
- Persist and restore last used wallet (fallback to All Wallets if archived)

### Phase 2 – Core Finance Logic
- Transfers between wallets (two linked transactions with shared transfer id)
- Editing and deleting transactions
  - Editing a transfer updates both sides
  - Deleting a transfer deletes both sides
- Category management (add/edit/archive)
- Wallet management in Settings (archive wallet; exclude archived wallets from All Wallets totals)

### Phase 3 – Reporting
- Monthly summary
- Yearly summary
- Custom date range summary
- Wallet filter (All wallets or individual wallet)
- Report rules (exclude transfers and adjustments; include future-dated txs if in range)

### Phase 4 – Quality & Enhancements
- Data export (CSV/JSON)
- Basic security lock (optional)
- UI polish
- Basic testing for calculation correctness

---

## 6. Future Enhancements (Not in MVP)
- Recurring transactions
- Budget tracking
- Tag system
- Charts and visual analytics
- Multi-currency support (true conversion)
- Sync across devices (e.g., cloud sync)
- Data export/import improvements

---

## 7. App Navigation Structure

The app will use a 4-tab layout with a prominent center action button for fast daily usage.

Tabs:
1. Transactions (default)
2. Reports
3. Planning (parked for now; placeholder tab)
4. Settings

Center (prominent button):
- Large "Add" button
- Always visible
- Opens Add Transaction screen for **Income/Expense** only.

Transactions top bar:
- Left: wallet dropdown trigger (icon only).
- Center: total amount for current wallet context.
  - If "All Wallets" is selected, show combined total across all active wallets.
- Right: actions menu icon with:
  - Transfer
  - Adjust balance

Default launch behavior:
- App opens on the **Transactions** tab.
- Shows the **last used wallet** by default.
- Transactions top bar shows:
  - Left: compact wallet dropdown trigger (icon only) for wallet switching.
  - Center: total amount for the currently selected wallet context.
  - Right: actions menu icon for Transfer and Adjust balance.

Transactions list presentation:
- Grouped by day.
- Sorted by most recent transaction (latest first).

Design Principle:
- Transaction entry and review are the most frequent actions.
- The app should feel immediate: open → see latest transactions → add quickly.

---

## 8. User Journeys

### 8.1 First-Time Setup
1. User opens the app.
2. If no currency preference exists, user is prompted to choose app currency from predefined options:
   - US Dollar (USD)
   - Vietnam Dong (VND)
3. After currency is set, if no wallets exist, user is prompted to create the first wallet.
4. User enters wallet name and initial balance.
5. App navigates to the Transactions tab showing this wallet.

### 8.2 Daily Usage
1. User opens the app.
2. App opens on Transactions tab showing the last used wallet.
3. User reviews recent transactions (grouped by day, latest first).
4. User taps the large Add button to record Income/Expense, or uses top-right menu for Transfer/Adjust balance.
5. User is navigated to the related dedicated screen and can return using a top-left back arrow.
6. User enters details and saves.
7. List and wallet balance update immediately.

### 8.3 Period Review
1. User opens Reports tab.
2. Selects Month / Year / Custom period.
3. Views total income, total expense, and net income.

### 8.4 Maintenance
- Manage wallets in Settings (create/edit/archive).
- Manage categories (add/edit/archive).
- Edit or delete transactions.

---

## 9. Screen List (MVP)

### 9.1 Transactions (Default Tab)
- Shows transactions for the last used wallet by default.
- Compact wallet dropdown trigger (top-left, wallet icon only) to switch wallets.
- Show total amount in the center for the selected wallet context.
  - If "All Wallets" is selected, show combined total across all active wallets.
- Top-right actions menu icon provides:
  - Transfer
  - Adjust balance
- Includes an "All Wallets" option.
  - When selected, transactions from all **active (non-archived)** wallets are shown in a single unified list.
  - Transfer transactions are shown normally in the list.
  - Transfers are visually marked (icon, badge, or distinct styling) to differentiate them from income and expense transactions.
- If the last used wallet is archived, default to "All Wallets" on launch.
- Transactions grouped by day.
- Sorted latest-first.
- Tap a transaction to view/edit.

### 9.2 Add Income/Expense Flow (Center Button)
- The center Add button opens `AddTransactionScreen` for Income/Expense only.
- Navigation behavior:
  - Standard header with top-left back arrow.
  - Back returns to previous screen without saving.

#### 9.2.1 Add Income / Expense
- Wallet selector.
- Amount.
- Category.
- Date (default today).
- Optional note.

Wallet preselection behavior (applies to all add-related screens):
- If Transactions tab is scoped to a specific wallet:
  - Preselect wallet in `AddTransactionScreen`.
  - Preselect `From wallet` in Transfer screen.
  - Preselect wallet in Adjust Balance screen.
- If Transactions tab is scoped to "All Wallets":
  - Leave wallet empty in `AddTransactionScreen` and require selection before save.
  - Leave `From wallet` empty in Transfer screen and require selection before save.
  - Leave wallet empty in Adjust Balance screen and require selection before save.

#### 9.2.2 Transfer (Top-Right Menu)
- From wallet.
- To wallet.
- Amount.
- Date.
- Optional note.

#### 9.2.3 Adjust Balance (Top-Right Menu)
- Wallet selector.
- Amount.
- Date.
- Optional note.

### 9.3 Transaction Detail / Edit
- View and edit all fields.
- Delete with confirmation.

### 9.4 Category Management
- List of categories.
- Add category.
- Edit category.
- Archive category.
- Toggle to show archived categories.

### 9.5 Reports (Tab)
- Period selector (Month / Year / Custom).
- Wallet filter:
  - All Wallets (default)
  - Individual wallet
- Metrics:
  - Total income
  - Total expense
  - Net income
- Reporting rules:
  - Transfer transactions are excluded from income/expense totals.
  - Future-dated transactions are included if they fall within the selected date range.

### 9.6 Settings (Tab)
- Wallet management (create/edit/archive).
- Currency settings (single global app preference applied to all wallets; choose from predefined options: USD, VND; explicitly warn user no conversion is performed).
- Other preferences.
- Future: data export.

### 9.7 Planning (Tab - Parked)
- Placeholder for future planning features.
- Not part of MVP implementation.

---

## 10. Business Rules & Constraints

### 10.1 Wallet Rules
- Wallets can be archived (preferred) rather than hard-deleted.
- Archived wallets are excluded from:
  - "All Wallets" combined balance
  - "All Wallets" unified transaction list
- If the last used wallet becomes archived, the app defaults to "All Wallets" on launch.

### 10.2 Transaction Rules
- Transaction amount is always positive.
- Income/Expense are created from the center Add button flow.
- Transfer/Adjust Balance are created from the top-right actions menu.
- Future-dated transactions are allowed.
  - Balance on Transactions tab is calculated up to today (future-dated excluded).
  - Reports include future-dated transactions if within the report date range.

### 10.3 Adjustment Rules
- Adjustment is a separate transaction type used to reconcile app balance with real-life balance.
- Adjustments affect wallet balance.
- Adjustments are excluded from income/expense reporting totals.
- Adjustments appear in transaction lists and are visually marked.

### 10.4 Transfer Rules
- Transfers are represented as two transactions linked by a shared transfer id.
- Editing one side of a transfer updates the other side.
- Deleting one side deletes both.
- Transfers cannot be created to/from archived wallets.
- Transfers are displayed in lists (including All Wallets) and visually marked.
- Transfers are excluded from income/expense reporting totals.

### 10.5 Reporting Rules
- Reports calculate:
  - Total income (income transactions only)
  - Total expense (expense transactions only)
  - Net income = income - expense
- Transfers and adjustments are excluded from income/expense totals.
- Future-dated transactions are included if they fall within the report date range.

### 10.6 Category Rules
- Categories are user-managed and can be archived (not hard-deleted).
- Archived categories remain linked to historical transactions.

### 10.7 Currency Rules
- App uses one currency preference for all wallets.
- Currency is selected from a predefined list (initially: USD, VND), not free-text input.
- Currency setting changes symbol/format only (no value conversion).
- App should explicitly warn users that no conversion is performed.

---

## 11. Success Criteria
The app is successful if:
- It reliably tracks all wallets.
- Balances always match expectations.
- Reports are accurate for any selected time range.
- Daily transaction entry feels fast and frictionless.
