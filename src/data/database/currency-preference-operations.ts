import { SQLiteDatabase } from 'expo-sqlite';

export type CurrencyPreferenceRow = {
  currencyCode: string;
  currencySymbol: string;
};

export async function getStoredCurrencyPreferenceRow(
  db: SQLiteDatabase,
  preferenceId: string
): Promise<CurrencyPreferenceRow | null> {
  const result = await db.getFirstAsync<CurrencyPreferenceRow>(
    `
      SELECT currencyCode, currencySymbol
      FROM user_preferences
      WHERE id = ?
      LIMIT 1;
    `,
    [preferenceId]
  );

  return result ?? null;
}

export async function upsertCurrencyPreferenceRow(
  db: SQLiteDatabase,
  params: CurrencyPreferenceRow,
  preferenceId: string,
  nowIso: string
): Promise<void> {
  await db.runAsync(
    `
      INSERT INTO user_preferences (id, currencyCode, currencySymbol, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        currencyCode = excluded.currencyCode,
        currencySymbol = excluded.currencySymbol,
        updatedAt = excluded.updatedAt;
    `,
    [preferenceId, params.currencyCode, params.currencySymbol, nowIso, nowIso]
  );
}
