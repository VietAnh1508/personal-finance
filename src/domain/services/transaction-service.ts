import {
  listTransactionsByWalletIds,
  saveTransaction,
  saveTransferTransactions,
  TransactionEntry,
} from '@/data/repositories';
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

export type AddTransferInput = {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  date: string;
  note?: string;
};

export type AddAdjustmentInput = {
  walletId: string;
  amount: number;
  date: string;
  note?: string;
};

function generateTransactionId(): string {
  return `txn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateTransferId(): string {
  return `trf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
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

export async function createTransferTransaction(input: AddTransferInput): Promise<void> {
  const fromWalletId = input.fromWalletId.trim();
  const toWalletId = input.toWalletId.trim();

  if (!fromWalletId) {
    throw new Error('From wallet is required');
  }

  if (!toWalletId) {
    throw new Error('To wallet is required');
  }

  if (fromWalletId === toWalletId) {
    throw new Error('From wallet and to wallet must be different');
  }

  if (input.amount <= 0 || !Number.isInteger(input.amount)) {
    throw new Error('Amount must be a positive integer in minor units');
  }

  const normalizedDate = input.date.trim();
  if (!isIsoDate(normalizedDate)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }

  const normalizedNote = input.note?.trim() ? input.note.trim() : null;
  const activeWallets = await getAllActiveWallets();
  const activeWalletIds = new Set(activeWallets.map((wallet) => wallet.id));
  if (!activeWalletIds.has(fromWalletId) || !activeWalletIds.has(toWalletId)) {
    throw new Error('Archived wallets cannot be used for transfers');
  }

  const transferId = generateTransferId();

  await saveTransferTransactions({
    outflow: {
      id: generateTransactionId(),
      walletId: fromWalletId,
      amount: input.amount,
      category: 'Transfer',
      date: normalizedDate,
      note: normalizedNote,
      transferId,
    },
    inflow: {
      id: generateTransactionId(),
      walletId: toWalletId,
      amount: input.amount,
      category: 'Transfer',
      date: normalizedDate,
      note: normalizedNote,
      transferId,
    },
  });
}

export async function createAdjustmentTransaction(input: AddAdjustmentInput): Promise<void> {
  const walletId = input.walletId.trim();
  if (!walletId) {
    throw new Error('Wallet is required');
  }

  if (input.amount === 0 || !Number.isInteger(input.amount)) {
    throw new Error('Amount must be a non-zero integer in minor units');
  }

  const normalizedDate = input.date.trim();
  if (!isIsoDate(normalizedDate)) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }

  const normalizedNote = input.note?.trim() ? input.note.trim() : null;

  await saveTransaction({
    id: generateTransactionId(),
    type: 'adjustment',
    walletId,
    amount: input.amount,
    category: 'Adjustment',
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
