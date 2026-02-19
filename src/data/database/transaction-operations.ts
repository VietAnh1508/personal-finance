import { SQLiteDatabase } from 'expo-sqlite';

export type TransactionRow = {
  id: string;
  type: string;
  walletId: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  transferId: string | null;
  createdAt: string;
};

export async function insertTransactionRow(
  db: SQLiteDatabase,
  params: {
    id: string;
    type: string;
    walletId: string;
    amount: number;
    category: string;
    date: string;
    note: string | null;
    transferId: string | null;
  },
  nowIso: string
): Promise<void> {
  await db.runAsync(
    `
      INSERT INTO transactions (id, type, walletId, amount, category, date, note, transferId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      params.id,
      params.type,
      params.walletId,
      params.amount,
      params.category,
      params.date,
      params.note,
      params.transferId,
      nowIso,
      nowIso,
    ]
  );
}

export async function getTransactionsByWalletIdsRows(
  db: SQLiteDatabase,
  walletIds: string[]
): Promise<TransactionRow[]> {
  if (walletIds.length === 0) {
    return [];
  }

  const placeholders = walletIds.map(() => '?').join(', ');

  return db.getAllAsync<TransactionRow>(
    `
      SELECT id, type, walletId, amount, category, date, note, transferId, createdAt
      FROM transactions
      WHERE walletId IN (${placeholders})
      ORDER BY date DESC, createdAt DESC;
    `,
    walletIds
  );
}
