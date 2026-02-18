import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

type CurrencyPreferenceRow = {
  currencyCode: string;
  currencySymbol: string;
};

type WalletRow = {
  id: string;
  name: string;
  initialBalance: number;
  iconKey: string;
  archivedAt: string | null;
};

const DB_NAME = 'personal-finance.db';
const DEFAULT_PREFERENCE_ID = 'default';

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
  const result = await db.getFirstAsync<CurrencyPreferenceRow>(
    `
      SELECT currencyCode, currencySymbol
      FROM user_preferences
      WHERE id = ?
      LIMIT 1;
    `,
    [DEFAULT_PREFERENCE_ID]
  );

  return result ?? null;
}

export async function upsertCurrencyPreference(params: CurrencyPreferenceRow): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();

  await db.runAsync(
    `
      INSERT INTO user_preferences (id, currencyCode, currencySymbol, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        currencyCode = excluded.currencyCode,
        currencySymbol = excluded.currencySymbol,
        updatedAt = excluded.updatedAt;
    `,
    [DEFAULT_PREFERENCE_ID, params.currencyCode, params.currencySymbol, nowIso, nowIso]
  );
}

export async function insertWallet(params: {
  id: string;
  name: string;
  initialBalance: number;
  iconKey: string;
}): Promise<void> {
  const db = await getDatabase();
  const nowIso = new Date().toISOString();

  await db.runAsync(
    `
      INSERT INTO wallets (id, name, initialBalance, iconKey, archivedAt, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, NULL, ?, ?);
    `,
    [params.id, params.name, params.initialBalance, params.iconKey, nowIso, nowIso]
  );
}

export async function getActiveWalletCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    `
      SELECT COUNT(*) AS count
      FROM wallets
      WHERE archivedAt IS NULL;
    `
  );

  return result?.count ?? 0;
}

export async function getFirstActiveWallet(): Promise<WalletRow | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<WalletRow>(
    `
      SELECT id, name, initialBalance, iconKey, archivedAt
      FROM wallets
      WHERE archivedAt IS NULL
      ORDER BY createdAt ASC
      LIMIT 1;
    `
  );

  return result ?? null;
}

export async function getActiveWallets(): Promise<WalletRow[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<WalletRow>(
    `
      SELECT id, name, initialBalance, iconKey, archivedAt
      FROM wallets
      WHERE archivedAt IS NULL
      ORDER BY createdAt ASC;
    `
  );

  return result;
}

export async function clearAppData(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM wallets;
    DELETE FROM user_preferences;
  `);
}
