import { getTransactionsByWalletIds, insertTransaction } from '@/data/database';
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
