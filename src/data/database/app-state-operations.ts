import { SQLiteDatabase } from 'expo-sqlite';

export type AppStateRow = {
  selectedWalletContext: string | null;
};

export async function getSelectedWalletContextRow(
  db: SQLiteDatabase,
  appStateId: string
): Promise<string | null> {
  const result = await db.getFirstAsync<AppStateRow>(
    `
      SELECT selectedWalletContext
      FROM app_state
      WHERE id = ?
      LIMIT 1;
    `,
    [appStateId]
  );

  return result?.selectedWalletContext ?? null;
}

export async function upsertSelectedWalletContextRow(
  db: SQLiteDatabase,
  appStateId: string,
  selectedWalletContext: string,
  nowIso: string
): Promise<void> {
  await db.runAsync(
    `
      INSERT INTO app_state (id, selectedWalletContext, createdAt, updatedAt)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        selectedWalletContext = excluded.selectedWalletContext,
        updatedAt = excluded.updatedAt;
    `,
    [appStateId, selectedWalletContext, nowIso, nowIso]
  );
}
