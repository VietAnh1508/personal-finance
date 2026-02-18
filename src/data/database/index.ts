import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';

type CurrencyPreferenceRow = {
  currencyCode: string;
  currencySymbol: string;
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
  `);
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
