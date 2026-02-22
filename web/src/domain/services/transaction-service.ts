import {
  deleteTransaction,
  deleteTransferTransactions,
  getTransactionById,
  listTransactionsByTransferId,
  type TransactionEntry,
  updateTransaction,
  updateTransferTransactions,
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

export type IncomeExpenseTransactionDetail = {
  kind: 'income_expense';
  id: string;
  type: IncomeExpenseTransactionType;
  walletId: string;
  amountMinorUnits: number;
  category: string;
  date: string;
  note: string;
};

export type AdjustmentTransactionDetail = {
  kind: 'adjustment';
  id: string;
  walletId: string;
  amountMinorUnits: number;
  date: string;
  note: string;
};

export type TransferTransactionDetail = {
  kind: 'transfer';
  id: string;
  transferId: string;
  fromWalletId: string;
  toWalletId: string;
  amountMinorUnits: number;
  date: string;
  note: string;
};

export type EditableTransactionDetail =
  | IncomeExpenseTransactionDetail
  | AdjustmentTransactionDetail
  | TransferTransactionDetail;

export async function getTransactionDetailById(id: string): Promise<EditableTransactionDetail | null> {
  const transaction = await getTransactionById(id);
  if (!transaction) {
    return null;
  }

  if (transaction.type === 'income' || transaction.type === 'expense') {
    return {
      kind: 'income_expense',
      id: transaction.id,
      type: transaction.type,
      walletId: transaction.walletId,
      amountMinorUnits: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      note: transaction.note ?? '',
    };
  }

  if (transaction.type === 'adjustment') {
    return {
      kind: 'adjustment',
      id: transaction.id,
      walletId: transaction.walletId,
      amountMinorUnits: transaction.amount,
      date: transaction.date,
      note: transaction.note ?? '',
    };
  }

  if (!transaction.transferId) {
    throw new Error('Transfer transaction is missing transfer id');
  }

  const linkedRows = await listTransactionsByTransferId(transaction.transferId);
  const outflow = linkedRows.find((row) => row.type === 'transfer_out');
  const inflow = linkedRows.find((row) => row.type === 'transfer_in');

  if (!outflow || !inflow) {
    throw new Error('Transfer transaction pair is incomplete');
  }

  return {
    kind: 'transfer',
    id: transaction.id,
    transferId: transaction.transferId,
    fromWalletId: outflow.walletId,
    toWalletId: inflow.walletId,
    amountMinorUnits: outflow.amount,
    date: outflow.date,
    note: outflow.note ?? '',
  };
}

export async function editIncomeExpenseTransaction(params: {
  id: string;
  walletId: string;
  type: IncomeExpenseTransactionType;
  amountMinorUnits: number;
  category: string;
  date: string;
  note?: string;
}): Promise<void> {
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

  await updateTransaction({
    id: params.id,
    type: params.type,
    walletId,
    amount: params.amountMinorUnits,
    category,
    date: params.date,
    note: params.note?.trim() || null,
  });
}

export async function editAdjustmentTransaction(params: {
  id: string;
  walletId: string;
  amountMinorUnits: number;
  date: string;
  note?: string;
}): Promise<void> {
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

  await updateTransaction({
    id: params.id,
    type: 'adjustment',
    walletId,
    amount: params.amountMinorUnits,
    category: 'Adjustment',
    date: params.date,
    note: params.note?.trim() || null,
  });
}

export async function editTransferTransaction(params: {
  transferId: string;
  fromWalletId: string;
  toWalletId: string;
  amountMinorUnits: number;
  date: string;
  note?: string;
}): Promise<void> {
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

  const note = params.note?.trim() || null;
  await updateTransferTransactions({
    transferId: params.transferId,
    outflow: {
      walletId: fromWalletId,
      amount: params.amountMinorUnits,
      date: params.date,
      note,
    },
    inflow: {
      walletId: toWalletId,
      amount: params.amountMinorUnits,
      date: params.date,
      note,
    },
  });
}

export async function deleteTransactionById(id: string): Promise<void> {
  const transaction = await getTransactionById(id);
  if (!transaction) {
    return;
  }

  if ((transaction.type === 'transfer_in' || transaction.type === 'transfer_out') && transaction.transferId) {
    await deleteTransferTransactions(transaction.transferId);
    return;
  }

  await deleteTransaction(id);
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
