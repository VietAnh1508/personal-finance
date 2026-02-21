import {
  type TransactionEntry,
  saveTransaction,
  listTransactionsByWalletIds,
} from '../../data/repositories';
import { type IncomeExpenseTransactionType } from '../transaction-type';
import { isIsoDate } from '../../utils/date-format';
import { getAllActiveWallets } from './wallet-service';

export function getSignedTransactionAmount(transaction: Pick<TransactionEntry, 'type' | 'amount'>): number {
  if (transaction.type === 'income' || transaction.type === 'transfer_in') {
    return transaction.amount;
  }

  if (transaction.type === 'expense' || transaction.type === 'transfer_out') {
    return -Math.abs(transaction.amount);
  }

  return transaction.amount;
}

export async function getTransactionsForWalletContext(context: 'all' | string): Promise<TransactionEntry[]> {
  const activeWallets = await getAllActiveWallets();
  const activeWalletIds = activeWallets.map((wallet) => wallet.id);

  if (context === 'all') {
    return listTransactionsByWalletIds(activeWalletIds);
  }

  if (!activeWalletIds.includes(context)) {
    return [];
  }

  return listTransactionsByWalletIds([context]);
}

export async function addIncomeExpenseTransaction(params: {
  walletId: string;
  type: IncomeExpenseTransactionType;
  amountMinorUnits: number;
  category: string;
  date: string;
  note?: string;
}): Promise<string> {
  const walletId = params.walletId.trim();
  if (!walletId) {
    throw new Error('Wallet is required');
  }

  if (params.type !== 'income' && params.type !== 'expense') {
    throw new Error('Transaction type must be income or expense');
  }

  if (!Number.isInteger(params.amountMinorUnits) || params.amountMinorUnits <= 0) {
    throw new Error('Amount must be a positive integer in minor units');
  }

  const category = params.category.trim();
  if (!category) {
    throw new Error('Category is required');
  }

  if (!isIsoDate(params.date)) {
    throw new Error('Date must use YYYY-MM-DD format');
  }

  const transactionId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? `txn_${crypto.randomUUID()}`
      : `txn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  const note = params.note?.trim() || null;

  await saveTransaction({
    id: transactionId,
    type: params.type,
    walletId,
    amount: params.amountMinorUnits,
    category,
    date: params.date,
    note,
    transferId: null,
  });

  return transactionId;
}
