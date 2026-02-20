import { TransactionEntry } from '@/data/repositories';
import { TransactionType } from '@/domain/transaction-type';

export function makeTransactionEntry(
  overrides: Partial<TransactionEntry> = {}
): TransactionEntry {
  return {
    id: 'txn_1',
    type: 'expense' as TransactionType,
    walletId: 'wallet_a',
    amount: 1000,
    category: 'Food',
    date: '2026-02-20',
    note: null,
    transferId: null,
    createdAt: '2026-02-20T10:00:00.000Z',
    ...overrides,
  };
}

export function makeTransferPair(
  overrides: {
    outflow?: Partial<TransactionEntry>;
    inflow?: Partial<TransactionEntry>;
  } = {}
): { outflow: TransactionEntry; inflow: TransactionEntry } {
  return {
    outflow: makeTransactionEntry({
      id: 'txn_out',
      type: 'transfer_out',
      walletId: 'wallet_a',
      amount: 2500,
      category: 'Transfer',
      transferId: 'trf_1',
      note: 'note',
      ...overrides.outflow,
    }),
    inflow: makeTransactionEntry({
      id: 'txn_in',
      type: 'transfer_in',
      walletId: 'wallet_b',
      amount: 2500,
      category: 'Transfer',
      transferId: 'trf_1',
      note: 'note',
      ...overrides.inflow,
    }),
  };
}

export function makeActiveWallet(overrides: { id?: string } = {}): { id: string } {
  return {
    id: 'wallet_a',
    ...overrides,
  };
}
