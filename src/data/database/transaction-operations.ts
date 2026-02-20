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

export async function getTransactionByIdRow(
  db: SQLiteDatabase,
  id: string
): Promise<TransactionRow | null> {
  const row = await db.getFirstAsync<TransactionRow>(
    `
      SELECT id, type, walletId, amount, category, date, note, transferId, createdAt
      FROM transactions
      WHERE id = ?
      LIMIT 1;
    `,
    [id]
  );

  return row ?? null;
}

export async function getTransactionsByTransferIdRows(
  db: SQLiteDatabase,
  transferId: string
): Promise<TransactionRow[]> {
  return db.getAllAsync<TransactionRow>(
    `
      SELECT id, type, walletId, amount, category, date, note, transferId, createdAt
      FROM transactions
      WHERE transferId = ?
      ORDER BY createdAt DESC;
    `,
    [transferId]
  );
}

export async function updateTransactionRow(
  db: SQLiteDatabase,
  params: {
    id: string;
    type: string;
    walletId: string;
    amount: number;
    category: string;
    date: string;
    note: string | null;
  },
  nowIso: string
): Promise<void> {
  await db.runAsync(
    `
      UPDATE transactions
      SET type = ?, walletId = ?, amount = ?, category = ?, date = ?, note = ?, updatedAt = ?
      WHERE id = ?;
    `,
    [
      params.type,
      params.walletId,
      params.amount,
      params.category,
      params.date,
      params.note,
      nowIso,
      params.id,
    ]
  );
}

export async function updateTransferPairRows(
  db: SQLiteDatabase,
  params: {
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
  },
  nowIso: string
): Promise<void> {
  await db.execAsync('BEGIN TRANSACTION;');

  try {
    await db.runAsync(
      `
        UPDATE transactions
        SET walletId = ?, amount = ?, date = ?, note = ?, updatedAt = ?
        WHERE transferId = ? AND type = 'transfer_out';
      `,
      [
        params.outflow.walletId,
        params.outflow.amount,
        params.outflow.date,
        params.outflow.note,
        nowIso,
        params.transferId,
      ]
    );

    await db.runAsync(
      `
        UPDATE transactions
        SET walletId = ?, amount = ?, date = ?, note = ?, updatedAt = ?
        WHERE transferId = ? AND type = 'transfer_in';
      `,
      [
        params.inflow.walletId,
        params.inflow.amount,
        params.inflow.date,
        params.inflow.note,
        nowIso,
        params.transferId,
      ]
    );

    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
}

export async function deleteTransactionRow(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync(
    `
      DELETE FROM transactions
      WHERE id = ?;
    `,
    [id]
  );
}

export async function deleteTransferPairRows(
  db: SQLiteDatabase,
  transferId: string
): Promise<void> {
  await db.runAsync(
    `
      DELETE FROM transactions
      WHERE transferId = ?;
    `,
    [transferId]
  );
}
