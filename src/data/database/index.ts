import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

import {
  CurrencyPreferenceRow,
  getStoredCurrencyPreferenceRow,
  upsertCurrencyPreferenceRow,
} from './currency-preference-operations';
import { getSelectedWalletContextRow, upsertSelectedWalletContextRow } from './app-state-operations';
import {
  archiveWalletRow,
  getActiveWalletCountRow,
  getActiveWalletRows,
  getArchivedWalletRows,
  getFirstActiveWalletRow,
  insertWalletRow,
  updateWalletRow,
  WalletRow,
} from './wallet-operations';
import {
  deleteTransactionRow,
  deleteTransferPairRows,
  getTransactionByIdRow,
  getTransactionsByTransferIdRows,
  getTransactionsByWalletIdsRows,
  insertTransferPairRows,
  insertTransactionRow,
  TransactionRow,
  updateTransactionRow,
  updateTransferPairRows,
} from './transaction-operations';

const DB_NAME = 'personal-finance.db';
const DEFAULT_PREFERENCE_ID = 'default';
const DEFAULT_APP_STATE_ID = 'default';

let databasePromise: Promise<SQLiteDatabase> | null = null;

async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY NOT NULL,
      currencyCode TEXT NOT NULL,
      currencySymbol TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      initialBalance INTEGER NOT NULL,
      iconKey TEXT NOT NULL DEFAULT 'wallet',
      archivedAt TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_state (
      id TEXT PRIMARY KEY NOT NULL,
      selectedWalletContext TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      walletId TEXT NOT NULL,
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      transferId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (walletId) REFERENCES wallets(id)
    );
  `);

  const walletColumns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(wallets);`);
  const hasIconKeyColumn = walletColumns.some((column) => column.name === 'iconKey');
  if (!hasIconKeyColumn) {
    await db.execAsync(`ALTER TABLE wallets ADD COLUMN iconKey TEXT NOT NULL DEFAULT 'wallet';`);
  }
}

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await openDatabaseAsync(DB_NAME);
      await initializeDatabase(db);
      return db;
    })();
  }

  return databasePromise;
}

export async function getStoredCurrencyPreference(): Promise<CurrencyPreferenceRow | null> {
  const db = await getDatabase();
  return getStoredCurrencyPreferenceRow(db, DEFAULT_PREFERENCE_ID);
}

export async function upsertCurrencyPreference(params: CurrencyPreferenceRow): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await upsertCurrencyPreferenceRow(db, params, DEFAULT_PREFERENCE_ID, nowIso);
}

export async function insertWallet(params: {
  id: string;
  name: string;
  initialBalance: number;
  iconKey: string;
}): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await insertWalletRow(db, params, nowIso);
}

export async function updateWallet(params: { id: string; name: string; iconKey: string }): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await updateWalletRow(db, params, nowIso);
}

export async function archiveWallet(params: { id: string }): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await archiveWalletRow(db, params, nowIso);
}

export async function getActiveWalletCount(): Promise<number> {
  const db = await getDatabase();
  return getActiveWalletCountRow(db);
}

export async function getFirstActiveWallet(): Promise<WalletRow | null> {
  const db = await getDatabase();
  return getFirstActiveWalletRow(db);
}

export async function getActiveWallets(): Promise<WalletRow[]> {
  const db = await getDatabase();
  return getActiveWalletRows(db);
}

export async function getArchivedWallets(): Promise<WalletRow[]> {
  const db = await getDatabase();
  return getArchivedWalletRows(db);
}

export async function getSelectedWalletContext(): Promise<string | null> {
  const db = await getDatabase();
  return getSelectedWalletContextRow(db, DEFAULT_APP_STATE_ID);
}

export async function upsertSelectedWalletContext(selectedWalletContext: string): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await upsertSelectedWalletContextRow(db, DEFAULT_APP_STATE_ID, selectedWalletContext, nowIso);
}

export async function insertTransaction(params: {
  id: string;
  type: string;
  walletId: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  transferId: string | null;
}): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await insertTransactionRow(db, params, nowIso);
}

export async function getTransactionsByWalletIds(walletIds: string[]): Promise<TransactionRow[]> {
  const db = await getDatabase();
  return getTransactionsByWalletIdsRows(db, walletIds);
}

export async function getTransactionById(id: string): Promise<TransactionRow | null> {
  const db = await getDatabase();
  return getTransactionByIdRow(db, id);
}

export async function getTransactionsByTransferId(transferId: string): Promise<TransactionRow[]> {
  const db = await getDatabase();
  return getTransactionsByTransferIdRows(db, transferId);
}

export async function insertTransferPair(params: {
  outflow: {
    id: string;
    walletId: string;
    amount: number;
    category: string;
    date: string;
    note: string | null;
    transferId: string;
  };
  inflow: {
    id: string;
    walletId: string;
    amount: number;
    category: string;
    date: string;
    note: string | null;
    transferId: string;
  };
}): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await insertTransferPairRows(db, params, nowIso);
}

export async function updateTransaction(params: {
  id: string;
  type: string;
  walletId: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
}): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await updateTransactionRow(db, params, nowIso);
}

export async function updateTransferPair(params: {
  transferId: string;
  outflow: {
    walletId: string;
    amount: number;
    date: string;
    note: string | null;
  };
  inflow: {
    walletId: string;
    amount: number;
    date: string;
    note: string | null;
  };
}): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();
  await updateTransferPairRows(db, params, nowIso);
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await deleteTransactionRow(db, id);
}

export async function deleteTransferPair(transferId: string): Promise<void> {
  const db = await getDatabase();
  await deleteTransferPairRows(db, transferId);
}

export async function clearAppData(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM transactions;
    DELETE FROM wallets;
    DELETE FROM user_preferences;
    DELETE FROM app_state;
  `);
}
