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

export async function insertTransferPairRows(
  db: SQLiteDatabase,
  params: {
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
  },
  nowIso: string
): Promise<void> {
  await db.execAsync('BEGIN TRANSACTION;');

  try {
    await db.runAsync(
      `
        INSERT INTO transactions (id, type, walletId, amount, category, date, note, transferId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        params.outflow.id,
        'transfer_out',
        params.outflow.walletId,
        params.outflow.amount,
        params.outflow.category,
        params.outflow.date,
        params.outflow.note,
        params.outflow.transferId,
        nowIso,
        nowIso,
      ]
    );

    await db.runAsync(
      `
        INSERT INTO transactions (id, type, walletId, amount, category, date, note, transferId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      [
        params.inflow.id,
        'transfer_in',
        params.inflow.walletId,
        params.inflow.amount,
        params.inflow.category,
        params.inflow.date,
        params.inflow.note,
        params.inflow.transferId,
        nowIso,
        nowIso,
      ]
    );

    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
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
