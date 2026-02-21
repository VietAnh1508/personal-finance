export type TransactionTypeShape = {
  income: true;
  expense: true;
  transfer_in: true;
  transfer_out: true;
  adjustment: true;
};

export type TransactionType = keyof TransactionTypeShape;
export type IncomeExpenseTransactionType = keyof Pick<
  TransactionTypeShape,
  'income' | 'expense'
>;

const TRANSACTION_TYPE_SET: Set<TransactionType> = new Set([
  'income',
  'expense',
  'transfer_in',
  'transfer_out',
  'adjustment',
]);

export const DEFAULT_TRANSACTION_TYPE: TransactionType = 'adjustment';

export function isTransactionType(value: string): value is TransactionType {
  return TRANSACTION_TYPE_SET.has(value as TransactionType);
}
