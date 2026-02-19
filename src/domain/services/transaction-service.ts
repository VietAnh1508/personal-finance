import { listTransactionsByWalletIds, saveTransaction, TransactionEntry } from '@/data/repositories';
import { IncomeExpenseTransactionType } from '@/domain/transaction-type';
import { getAllActiveWallets } from '@/domain/services/wallet-service';
import { isIsoDate } from '@/utils/date-format';

export type AddIncomeExpenseInput = {
  walletId: string;
  type: IncomeExpenseTransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
};

function generateTransactionId(): string {
  return `txn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getSignedTransactionAmount(transaction: Pick<TransactionEntry, 'type' | 'amount'>): number {
  if (transaction.type === 'income' || transaction.type === 'transfer_in') {
    return transaction.amount;
  }

  if (transaction.type === 'expense' || transaction.type === 'transfer_out') {
    return -Math.abs(transaction.amount);
  }

  return transaction.amount;
}

export async function createIncomeExpenseTransaction(input: AddIncomeExpenseInput): Promise<void> {
  if (!input.walletId.trim()) {
    throw new Error('Wallet is required');
  }

  if (input.amount <= 0 || !Number.isInteger(input.amount)) {
    throw new Error('Amount must be a positive integer in minor units');
  }

  const normalizedCategory = input.category.trim();
  if (!normalizedCategory) {
    throw new Error('Category is required');
  }

  const normalizedDate = input.date.trim();
  if (!isIsoDate(normalizedDate)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }

  const normalizedNote = input.note?.trim() ? input.note.trim() : null;

  await saveTransaction({
    id: generateTransactionId(),
    type: input.type,
    walletId: input.walletId,
    amount: input.amount,
    category: normalizedCategory,
    date: normalizedDate,
    note: normalizedNote,
    transferId: null,
  });
}

export async function getTransactionsForWalletContext(
  context: 'all' | string
): Promise<TransactionEntry[]> {
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
