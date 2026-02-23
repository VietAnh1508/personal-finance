import { type SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { PageLoadingState } from '@/components/PageLoadingState';
import { getCurrencySymbol } from '@/domain/currency';
import { addIncomeExpenseTransaction } from '@/domain/services';
import { type IncomeExpenseTransactionType } from '@/domain/transaction-type';
import { todayIsoDate } from '@/utils/date-format';
import { formatAmountInput, isValidAmountInput, parseAmountToMinorUnits } from '@/utils/money-format';
import { useToast } from '@/features/feedback/ToastProvider';
import { IncomeExpenseTypeField } from '@/features/transactions/IncomeExpenseTypeField';
import { useTransactionFormContextQuery } from '@/features/transactions/useTransactionFormContextQuery';

const CATEGORY_SUGGESTIONS: Record<IncomeExpenseTransactionType, string[]> = {
  income: ['Salary', 'Bonus', 'Gift', 'Refund', 'Interest', 'Other income'],
  expense: ['Groceries', 'Rent', 'Transport', 'Dining', 'Utilities', 'Other expense'],
};

export function AddIncomeExpensePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [walletIdOverride, setWalletIdOverride] = useState<string | null>(null);
  const [type, setType] = useState<IncomeExpenseTransactionType>('expense');
  const [amountInput, setAmountInput] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formContextQuery = useTransactionFormContextQuery();
  const wallets = formContextQuery.data?.wallets ?? [];
  const walletId = walletIdOverride ?? formContextQuery.data?.preselectedWalletId ?? '';

  const currencySymbol = getCurrencySymbol(formContextQuery.data?.currencyCode ?? 'USD');
  const categorySuggestions = CATEGORY_SUGGESTIONS[type];
  const loadErrorMessage =
    formContextQuery.error instanceof Error ? formContextQuery.error.message : 'Unable to load transaction form.';

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    setErrorMessage(null);

    const normalizedAmount = parseAmountToMinorUnits(amountInput);
    if (normalizedAmount === null || normalizedAmount <= 0) {
      setErrorMessage('Amount must be greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      await addIncomeExpenseTransaction({
        walletId,
        type,
        amountMinorUnits: normalizedAmount,
        category,
        date,
        note,
      });

      showToast({
        type: 'success',
        message: 'Transaction saved.',
      });
      navigate('/transactions');
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to save transaction.',
      });
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAmountInputChange = (value: string) => {
    const normalizedValue = value.replace(/,/g, '');

    if (!normalizedValue) {
      setAmountInput('');
      return;
    }

    if (!isValidAmountInput(normalizedValue)) {
      return;
    }

    setAmountInput(formatAmountInput(normalizedValue));
  };

  if (formContextQuery.isLoading) {
    return <PageLoadingState message="Loading form..." title="Add transaction" />;
  }

  return (
    <section className="pf-card p-7">
      <PageHeader backTo="/transactions" title="Add transaction" />

      <form className="mt-6 space-y-4" noValidate onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="pf-label" htmlFor="add-transaction-wallet">
            Wallet
          </label>
          <select
            className="w-full pf-input"
            id="add-transaction-wallet"
            onChange={(event) => setWalletIdOverride(event.target.value)}
            required
            value={walletId}>
            <option value="">Select wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
        </div>

        <IncomeExpenseTypeField id="add-transaction-type" onChange={setType} value={type} />

        <div className="space-y-2">
          <label className="pf-label" htmlFor="add-transaction-amount">
            Amount ({currencySymbol})
          </label>
          <input
            autoComplete="off"
            className="w-full pf-input"
            id="add-transaction-amount"
            inputMode="decimal"
            name="amount"
            onChange={(event) => onAmountInputChange(event.target.value)}
            placeholder="0.00"
            required
            type="text"
            value={amountInput}
          />
        </div>

        <div className="space-y-2">
          <label className="pf-label" htmlFor="add-transaction-category">
            Category
          </label>
          <input
            className="w-full pf-input"
            id="add-transaction-category"
            list="add-transaction-category-list"
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Select or type category"
            required
            value={category}
          />
          <datalist id="add-transaction-category-list">
            {categorySuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <label className="pf-label" htmlFor="add-transaction-date">
            Date
          </label>
          <input
            className="w-full pf-input"
            id="add-transaction-date"
            onChange={(event) => setDate(event.target.value)}
            required
            type="date"
            value={date}
          />
        </div>

        <div className="space-y-2">
          <label className="pf-label" htmlFor="add-transaction-note">
            Note (optional)
          </label>
          <textarea
            className="min-h-24 w-full pf-input"
            id="add-transaction-note"
            onChange={(event) => setNote(event.target.value)}
            value={note}
          />
        </div>

        {errorMessage || formContextQuery.error ? (
          <p className="pf-error-box">
            {errorMessage ?? loadErrorMessage}
          </p>
        ) : null}

        <button
          className="pf-button-primary"
          disabled={isSubmitting}
          type="submit">
          {isSubmitting ? 'Saving...' : 'Save transaction'}
        </button>
      </form>
    </section>
  );
}
