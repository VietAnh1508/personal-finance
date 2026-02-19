# TECHNICAL_ARCHITECTURE.md

## 1. Overview

This document defines the technical architecture for the Personal Finance App. The app is designed as an offline-first, ledger-based system with strong correctness guarantees around financial calculations.

Primary goals:
- Deterministic and accurate balance calculations
- Clear separation between UI and business logic
- Offline-first architecture
- Maintainable and scalable structure

---

## 2. Tech Stack

### 2.1 Platform
- **React Native (Expo Dev Client)**
- **TypeScript** (mandatory for type safety and financial correctness)
- **MVP target platform: iOS only** (Android is out of MVP scope)

Rationale:
- Fast iteration speed
- iOS-first delivery without native Swift-only constraints
- Cross-platform path remains available for post-MVP phases
- Strong ecosystem
- Lower barrier compared to native iOS (Swift)

### 2.2 Core Libraries

- Navigation: `@react-navigation/native`
- State management: `zustand` (lightweight and predictable)
- Forms: `react-hook-form`
- Validation: `zod`
- Date handling: `dayjs`
- Local database: `expo-sqlite` (SQLite)

---

## 3. Architectural Principles

1. **Ledger is source of truth** – All balances are derived from transactions.
2. **Money stored as integer** – Store smallest currency unit (e.g., cents).
3. **Business logic isolated from UI** – Domain layer must not depend on React.
4. **Transfers are two transactions** – Linked by shared `transferId`.
5. **Future-dated transactions**:
   - Excluded from "balance up to today"
   - Included in reports if within selected date range
6. **Adjustments**:
   - Affect balances
   - Excluded from income/expense report totals

---

## 4. Data Layer (SQLite)

SQLite is used as the primary local storage engine.

### 4.1 Tables

#### wallets
- `id` (uuid, primary key)
- `name` (text)
- `initialBalance` (integer)
- `iconKey` (text; predefined wallet icon key)
- `archivedAt` (datetime, nullable)
- `createdAt` (datetime)
- `updatedAt` (datetime)

Rules:
- Archived wallets cannot receive or send transfers.
- If last used wallet is archived, default to "All Wallets".

#### categories
- `id` (uuid, primary key)
- `name` (text)
- `kind` (enum: income | expense)
- `archivedAt` (datetime, nullable)
- `createdAt` (datetime)
- `updatedAt` (datetime)

Rules:
- Archived categories cannot be selected for new transactions.

#### user_preferences
- `id` (text, primary key; fixed value, e.g., `default`)
- `currencyCode` (text)
- `currencySymbol` (text)
- `createdAt` (datetime)
- `updatedAt` (datetime)

Rules:
- One global currency preference is applied across all wallets.
- Currency is selected from a predefined list (initially `USD`, `VND`), not manual free-text entry.
- Updating currency changes display symbol/format only; stored transaction amounts are not converted.
- Currency display behavior (symbol and decimal precision) is defined in domain metadata (`src/domain/currency.ts`), not hardcoded in screen components.

#### transactions
- `id` (uuid, primary key)
- `walletId` (foreign key)
- `type` (enum: income | expense | transfer_in | transfer_out | adjustment)
- `amount` (integer, always positive)
- `date` (datetime)
- `categoryId` (nullable)
- `note` (nullable)
- `transferId` (nullable, shared between transfer pair)
- `createdAt` (datetime)
- `updatedAt` (datetime)

Rules:
- Amount is always positive.
- Transaction type determines balance effect.
- Date storage format is ISO `YYYY-MM-DD` (for deterministic sorting/filtering).
- Date display format in UI is `DD/MM/YYYY` (current default for MVP).

### 4.2 Indexes

- Index on `(walletId, date)`
- Index on `date`
- Index on `transferId`

---

## 5. Domain Layer

The domain layer contains all financial logic and must be UI-agnostic.

### 5.0 Currency Metadata

`src/domain/currency.ts` is the single source of truth for supported currencies and display metadata.

Each currency entry includes:
- `code`
- `label`
- `symbol`
- `fractionDigits` (UI formatting precision, e.g. `USD: 2`, `VND: 0`)

Helpers:
- `getCurrencySymbol(code)`
- `getCurrencyFractionDigits(code)`
- `isSupportedCurrencyCode(value)`

### 5.1 WalletService

Responsibilities:
- createWallet(name, initialBalance)
- archiveWallet(walletId)
- getWalletBalance(walletId, asOfDate)

Balance calculation:
initialBalance + sum(all transactions up to asOfDate)

---

### 5.2 TransactionService

Responsibilities:
- addTransaction(data)
- editTransaction(id, patch)
- deleteTransaction(id)
- listTransactions(filter)

Rules:
- `addTransaction` supports `income | expense | adjustment`.
- Validation and required fields are determined by transaction `type`.
- Transfer creation is handled by `TransferService` (not `addTransaction`).

Filtering supports:
- walletId or all active wallets
- date range

---

### 5.3 TransferService

Responsibilities:
- createTransfer(fromWalletId, toWalletId, amount, date, note)
- editTransfer(transferId, patch)
- deleteTransfer(transferId)

Rules:
- Creates two transactions:
  - transfer_out (from wallet)
  - transfer_in (to wallet)
- Both share same transferId.
- Editing updates both rows consistently.
- Deleting removes both rows.
- Cannot transfer to/from archived wallet.

---

### 5.4 ReportService

Responsibilities:
- getSummary({ range, walletId? })

`getSummary` returns:
- totalIncome
- totalExpense
- netIncome (`totalIncome - totalExpense`)

Computation includes:
- income transactions in `totalIncome`
- expense transactions in `totalExpense`

Computation excludes:
- transfer_in
- transfer_out
- adjustment

---

## 6. Balance & Reporting Logic

### 6.1 Wallet Balance (Transactions Tab)

For selected wallet or "All Wallets":

Balance =
- initialBalance(s)
- + income
- - expense
- + transfer_in
- - transfer_out
- +/- adjustment

Only transactions where `date <= today` are included.

---

### 6.2 Reports

For selected date range:

Income Total = sum(type = income)
Expense Total = sum(type = expense)
Net Income = Income Total - Expense Total

Only `income` and `expense` transaction types contribute to report totals.
`transfer_in`, `transfer_out`, and `adjustment` are explicitly excluded.

Future-dated transactions are included if inside the selected range.

---

## 7. UI Architecture

### 7.1 Navigation Structure

Bottom Tabs:
- Transactions
- Reports
- Planning (future)
- Settings

Floating center button:
- Navigate to `AddTransactionScreen` (Income/Expense only)

Transactions top bar:
- Left: wallet selector trigger (icon only; includes "All Wallets")
- Center: total amount for selected wallet context
  - If "All Wallets" is selected, show combined total across all active wallets.
- Right: actions menu icon with:
  - Transfer
  - Adjust balance

---

### 7.2 Core Screens (MVP)

1. TransactionsScreen
   - Top bar with left wallet selector trigger (icon only), centered total amount, and right actions menu icon
   - "All Wallets" context shows combined total across all active wallets
   - Group by date
   - Show balance

2. AddTransactionScreen
   - Income / Expense form
   - Opened from center Add button
   - If a wallet is selected in Transactions tab, preselect it
   - If "All Wallets" is selected, wallet starts empty and must be selected before save
   - Uses standard screen header with top-left back arrow

3. AddTransferScreen
   - Transfer form
   - Opened from top-right actions menu
   - If a wallet is selected in Transactions tab, preselect it as `fromWallet`
   - If "All Wallets" is selected, `fromWallet` starts empty and must be selected before save
   - Uses standard screen header with top-left back arrow

4. AddAdjustmentScreen
   - Adjustment form
   - Opened from top-right actions menu
   - If a wallet is selected in Transactions tab, preselect it
   - If "All Wallets" is selected, wallet starts empty and must be selected before save
   - Uses standard screen header with top-left back arrow

5. TransactionDetailScreen

6. CategoriesScreen

7. ReportsScreen

8. CurrencySetupScreen
   - Shown on first app launch before wallet creation
   - User chooses global app currency from predefined options (`USD`, `VND`)

9. SettingsScreen
   - Wallet management
   - Currency preference (global for all wallets; predefined options `USD`, `VND`)
   - Show warning that changing currency does not convert existing amounts

---

## 8. State Management Strategy

- UI state: Zustand store
- Persistent data: SQLite only
- No duplication of financial data in global state
- Always query DB for authoritative totals

---

## 9. Testing Strategy

### 9.1 Unit Tests (Domain Layer)

- Transfer creates two transactions
- Editing transfer updates both
- Deleting transfer removes both
- Future-dated exclusion from current balance
- Adjustment excluded from report totals

### 9.2 Integration Tests

- Seed database
- Run report queries
- Validate totals

---

## 10. Implementation Phases

### Phase 1 – Foundation
- Project setup
- SQLite schema + migration system
- First-run currency setup (global preference) before first wallet creation
- Wallet creation and listing
- Initial balance setup
- Transactions tab (single wallet + All Wallets option)
- Basic income/expense recording
- Group transactions by day, sorted latest-first
- Persist and restore last used wallet (fallback to All Wallets if archived)

### Phase 2 – Core Finance Logic
- Transfers between wallets (two linked transactions with shared transferId)
- Edit and delete transactions (including transfer consistency rules)
- Category management (add/edit/archive)
- Wallet management in Settings (archive wallet; exclude archived wallets from All Wallets totals/list)

### Phase 3 – Reporting
- Monthly summary
- Yearly summary
- Custom date range summary
- Wallet filter (All wallets or individual wallet)
- Report rules (exclude transfers and adjustments; include future-dated transactions when in range)

### Phase 4 – Quality & Enhancements
- Data export (CSV/JSON)
- App lock (optional)
- UI polish
- Basic testing for calculation correctness

---

## 11. Future Considerations

- Cloud sync (optional, later phase)
- Multi-currency support
- Budgeting module (Planning tab)
- Recurring transactions

---

End of document.
