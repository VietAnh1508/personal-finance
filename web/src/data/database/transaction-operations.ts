import { db, type TransactionRow } from '@/data/database/schema';

export async function insertTransactionRow(
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
  await db.transactions.add({
    id: params.id,
    type: params.type,
    walletId: params.walletId,
    amount: params.amount,
    category: params.category,
    date: params.date,
    note: params.note,
    transferId: params.transferId,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
}

export async function insertTransferPairRows(
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
  await db.transaction('rw', db.transactions, async () => {
    await db.transactions.add({
      id: params.outflow.id,
      type: 'transfer_out',
      walletId: params.outflow.walletId,
      amount: params.outflow.amount,
      category: params.outflow.category,
      date: params.outflow.date,
      note: params.outflow.note,
      transferId: params.outflow.transferId,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    await db.transactions.add({
      id: params.inflow.id,
      type: 'transfer_in',
      walletId: params.inflow.walletId,
      amount: params.inflow.amount,
      category: params.inflow.category,
      date: params.inflow.date,
      note: params.inflow.note,
      transferId: params.inflow.transferId,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  });
}

export async function getTransactionsByWalletIdsRows(walletIds: string[]): Promise<TransactionRow[]> {
  if (walletIds.length === 0) {
    return [];
  }

  const walletIdSet = new Set(walletIds);
  const rows = await db.transactions.toArray();

  return rows
    .filter((row) => walletIdSet.has(row.walletId))
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) {
        return dateCompare;
      }

      return b.createdAt.localeCompare(a.createdAt);
    });
}

export async function getTransactionByIdRow(id: string): Promise<TransactionRow | null> {
  const row = await db.transactions.get(id);
  return row ?? null;
}

export async function getTransactionsByTransferIdRows(transferId: string): Promise<TransactionRow[]> {
  const rows = await db.transactions.where('transferId').equals(transferId).toArray();
  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return rows;
}

export async function updateTransactionRow(
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
  const row = await db.transactions.get(params.id);
  if (!row) {
    return;
  }

  await db.transactions.put({
    ...row,
    type: params.type,
    walletId: params.walletId,
    amount: params.amount,
    category: params.category,
    date: params.date,
    note: params.note,
    updatedAt: nowIso,
  });
}

export async function updateTransferPairRows(
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
  await db.transaction('rw', db.transactions, async () => {
    const outflow = await db.transactions
      .where({ transferId: params.transferId, type: 'transfer_out' })
      .first();

    if (outflow) {
      await db.transactions.put({
        ...outflow,
        walletId: params.outflow.walletId,
        amount: params.outflow.amount,
        date: params.outflow.date,
        note: params.outflow.note,
        updatedAt: nowIso,
      });
    }

    const inflow = await db.transactions
      .where({ transferId: params.transferId, type: 'transfer_in' })
      .first();

    if (inflow) {
      await db.transactions.put({
        ...inflow,
        walletId: params.inflow.walletId,
        amount: params.inflow.amount,
        date: params.inflow.date,
        note: params.inflow.note,
        updatedAt: nowIso,
      });
    }
  });
}

export async function deleteTransactionRow(id: string): Promise<void> {
  await db.transactions.delete(id);
}

export async function deleteTransferPairRows(transferId: string): Promise<void> {
  const rows = await db.transactions.where('transferId').equals(transferId).primaryKeys();
  await db.transactions.bulkDelete(rows as string[]);
}
