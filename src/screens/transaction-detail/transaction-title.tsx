import { ThemedText } from '@/components/themed-text';
import { IncomeExpenseTransactionType } from '@/domain/transaction-type';

type TransactionTitleProps = {
  mode: 'income_expense' | 'transfer' | 'adjustment' | null;
  transactionType: IncomeExpenseTransactionType;
};

function getTransactionTitle(
  mode: 'income_expense' | 'transfer' | 'adjustment' | null,
  transactionType: IncomeExpenseTransactionType
): string {
  if (mode === 'income_expense') {
    return transactionType === 'income' ? 'Income' : 'Expense';
  }

  if (mode === 'transfer') {
    return 'Transfer';
  }

  if (mode === 'adjustment') {
    return 'Adjustment';
  }

  return 'Transaction';
}

export function TransactionTitle({ mode, transactionType }: TransactionTitleProps) {
  return <ThemedText type="title">{getTransactionTitle(mode, transactionType)}</ThemedText>;
}
