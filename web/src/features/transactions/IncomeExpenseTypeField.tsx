import { type IncomeExpenseTransactionType } from '@/domain/transaction-type';

type IncomeExpenseTypeFieldProps = {
  id: string;
  value: IncomeExpenseTransactionType;
  onChange: (nextType: IncomeExpenseTransactionType) => void;
};

export function IncomeExpenseTypeField({ id, value, onChange }: IncomeExpenseTypeFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-200" htmlFor={id}>
        Type
      </label>
      <select
        className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
        id={id}
        onChange={(event) => onChange(event.target.value as IncomeExpenseTransactionType)}
        value={value}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
    </div>
  );
}
