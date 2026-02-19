import { SQLiteDatabase } from 'expo-sqlite';

export type WalletRow = {
  id: string;
  name: string;
  initialBalance: number;
  iconKey: string;
  archivedAt: string | null;
};

export async function insertWalletRow(
  db: SQLiteDatabase,
  params: {
    id: string;
    name: string;
    initialBalance: number;
    iconKey: string;
  },
  nowIso: string
): Promise<void> {
  await db.runAsync(
    `
      INSERT INTO wallets (id, name, initialBalance, iconKey, archivedAt, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, NULL, ?, ?);
    `,
    [params.id, params.name, params.initialBalance, params.iconKey, nowIso, nowIso]
  );
}

export async function updateWalletRow(
  db: SQLiteDatabase,
  params: { id: string; name: string; iconKey: string },
  nowIso: string
): Promise<void> {
  await db.runAsync(
    `
      UPDATE wallets
      SET name = ?, iconKey = ?, updatedAt = ?
      WHERE id = ? AND archivedAt IS NULL;
    `,
    [params.name, params.iconKey, nowIso, params.id]
  );
}

export async function archiveWalletRow(
  db: SQLiteDatabase,
  params: { id: string },
  nowIso: string
): Promise<void> {
  await db.runAsync(
    `
      UPDATE wallets
      SET archivedAt = ?, updatedAt = ?
      WHERE id = ? AND archivedAt IS NULL;
    `,
    [nowIso, nowIso, params.id]
  );
}

export async function getActiveWalletCountRow(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ count: number }>(
    `
      SELECT COUNT(*) AS count
      FROM wallets
      WHERE archivedAt IS NULL;
    `
  );

  return result?.count ?? 0;
}

export async function getFirstActiveWalletRow(db: SQLiteDatabase): Promise<WalletRow | null> {
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

export async function getActiveWalletRows(db: SQLiteDatabase): Promise<WalletRow[]> {
  return db.getAllAsync<WalletRow>(
    `
      SELECT id, name, initialBalance, iconKey, archivedAt
      FROM wallets
      WHERE archivedAt IS NULL
      ORDER BY createdAt ASC;
    `
  );
}

export async function getArchivedWalletRows(db: SQLiteDatabase): Promise<WalletRow[]> {
  return db.getAllAsync<WalletRow>(
    `
      SELECT id, name, initialBalance, iconKey, archivedAt
      FROM wallets
      WHERE archivedAt IS NOT NULL
      ORDER BY archivedAt DESC;
    `
  );
}
