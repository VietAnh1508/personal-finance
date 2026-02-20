import { getTransactionsByWalletIds, insertTransaction, insertTransferPair } from '@/data/database';
import {
  DEFAULT_TRANSACTION_TYPE,
  isTransactionType,
  TransactionType,
} from '@/domain/transaction-type';

export type TransactionEntry = {
  id: string;
  type: TransactionType;
  walletId: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  transferId: string | null;
  createdAt: string;
};

export async function saveTransaction(entry: Omit<TransactionEntry, 'createdAt'>): Promise<void> {
  await insertTransaction({
    ...entry,
    type: entry.type,
  });
}

export async function listTransactionsByWalletIds(walletIds: string[]): Promise<TransactionEntry[]> {
  const rows = await getTransactionsByWalletIds(walletIds);

  return rows.map((row) => ({
    id: row.id,
    type: isTransactionType(row.type) ? row.type : DEFAULT_TRANSACTION_TYPE,
    walletId: row.walletId,
    amount: row.amount,
    category: row.category,
    date: row.date,
    note: row.note,
    transferId: row.transferId,
    createdAt: row.createdAt,
  }));
}

export async function saveTransferTransactions(params: {
  outflow: Omit<TransactionEntry, 'type' | 'createdAt' | 'transferId'> & { transferId: string };
  inflow: Omit<TransactionEntry, 'type' | 'createdAt' | 'transferId'> & { transferId: string };
}): Promise<void> {
  await insertTransferPair({
    outflow: {
      id: params.outflow.id,
      walletId: params.outflow.walletId,
      amount: params.outflow.amount,
      category: params.outflow.category,
      date: params.outflow.date,
      note: params.outflow.note,
      transferId: params.outflow.transferId,
    },
    inflow: {
      id: params.inflow.id,
      walletId: params.inflow.walletId,
      amount: params.inflow.amount,
      category: params.inflow.category,
      date: params.inflow.date,
      note: params.inflow.note,
      transferId: params.inflow.transferId,
    },
  });
}
