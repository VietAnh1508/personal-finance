import {
  type TransactionEntry,
  saveTransferTransactions,
  saveTransaction,
  listTransactionsByWalletIds,
} from '@/data/repositories';
import { type IncomeExpenseTransactionType } from '@/domain/transaction-type';
import { isIsoDate } from '@/utils/date-format';
import { getAllActiveWallets } from '@/domain/services/wallet-service';

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

  const transactionId = generateTransactionId();

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

export async function addTransferTransaction(params: {
  fromWalletId: string;
  toWalletId: string;
  amountMinorUnits: number;
  date: string;
  note?: string;
}): Promise<string> {
  const fromWalletId = params.fromWalletId.trim();
  const toWalletId = params.toWalletId.trim();

  if (!fromWalletId) {
    throw new Error('From wallet is required');
  }

  if (!toWalletId) {
    throw new Error('To wallet is required');
  }

  if (fromWalletId === toWalletId) {
    throw new Error('From wallet and to wallet must be different');
  }

  if (!Number.isInteger(params.amountMinorUnits) || params.amountMinorUnits <= 0) {
    throw new Error('Amount must be a positive integer in minor units');
  }

  if (!isIsoDate(params.date)) {
    throw new Error('Date must use YYYY-MM-DD format');
  }

  const activeWallets = await getAllActiveWallets();
  const activeWalletIds = new Set(activeWallets.map((wallet) => wallet.id));
  if (!activeWalletIds.has(fromWalletId) || !activeWalletIds.has(toWalletId)) {
    throw new Error('Archived wallets cannot be used for transfers');
  }

  const transferId = generateTransferId();
  const note = params.note?.trim() || null;

  await saveTransferTransactions({
    outflow: {
      id: generateTransactionId(),
      walletId: fromWalletId,
      amount: params.amountMinorUnits,
      category: 'Transfer',
      date: params.date,
      note,
      transferId,
    },
    inflow: {
      id: generateTransactionId(),
      walletId: toWalletId,
      amount: params.amountMinorUnits,
      category: 'Transfer',
      date: params.date,
      note,
      transferId,
    },
  });

  return transferId;
}

export async function addAdjustmentTransaction(params: {
  walletId: string;
  amountMinorUnits: number;
  date: string;
  note?: string;
}): Promise<string> {
  const walletId = params.walletId.trim();
  if (!walletId) {
    throw new Error('Wallet is required');
  }

  if (!Number.isInteger(params.amountMinorUnits) || params.amountMinorUnits === 0) {
    throw new Error('Amount must be a non-zero integer in minor units');
  }

  if (!isIsoDate(params.date)) {
    throw new Error('Date must use YYYY-MM-DD format');
  }

  const transactionId = generateTransactionId();
  const note = params.note?.trim() || null;

  await saveTransaction({
    id: transactionId,
    type: 'adjustment',
    walletId,
    amount: params.amountMinorUnits,
    category: 'Adjustment',
    date: params.date,
    note,
    transferId: null,
  });

  return transactionId;
}

function generateTransactionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `txn_${crypto.randomUUID()}`;
  }

  return `txn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateTransferId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `trf_${crypto.randomUUID()}`;
  }

  return `trf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
