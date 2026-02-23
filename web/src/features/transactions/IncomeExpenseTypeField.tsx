import { type IncomeExpenseTransactionType } from '@/domain/transaction-type';

type IncomeExpenseTypeFieldProps = {
  id: string;
  value: IncomeExpenseTransactionType;
  onChange: (nextType: IncomeExpenseTransactionType) => void;
};

export function IncomeExpenseTypeField({ id, value, onChange }: IncomeExpenseTypeFieldProps) {
  return (
    <div className="space-y-2">
      <label className="pf-label" htmlFor={id}>
        Type
      </label>
      <select
        className="w-full pf-input"
        id={id}
        onChange={(event) => onChange(event.target.value as IncomeExpenseTransactionType)}
        value={value}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
    </div>
  );
}
