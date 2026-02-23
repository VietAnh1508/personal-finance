import { type SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { PageLoadingState } from '@/components/PageLoadingState';
import { getCurrencySymbol } from '@/domain/currency';
import { addAdjustmentTransaction } from '@/domain/services';
import { todayIsoDate } from '@/utils/date-format';
import { formatAmountInput, isValidAmountInput, parseAmountToMinorUnits } from '@/utils/money-format';
import { useToast } from '@/features/feedback/ToastProvider';
import {
  AdjustmentDirectionField,
  type AdjustmentDirection,
} from '@/features/transactions/AdjustmentDirectionField';
import { useTransactionFormContextQuery } from '@/features/transactions/useTransactionFormContextQuery';

export function AddAdjustmentPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [walletIdOverride, setWalletIdOverride] = useState<string | null>(null);
  const [direction, setDirection] = useState<AdjustmentDirection>('increase');
  const [amountInput, setAmountInput] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formContextQuery = useTransactionFormContextQuery();
  const wallets = formContextQuery.data?.wallets ?? [];
  const walletId = walletIdOverride ?? formContextQuery.data?.preselectedWalletId ?? '';

  const currencySymbol = getCurrencySymbol(formContextQuery.data?.currencyCode ?? 'USD');
  const loadErrorMessage =
    formContextQuery.error instanceof Error ? formContextQuery.error.message : 'Unable to load adjustment form.';

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseAmountToMinorUnits(amountInput);
    if (parsedAmount === null || parsedAmount <= 0) {
      setErrorMessage('Amount must be non-zero.');
      return;
    }

    const signedAmount = direction === 'decrease' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
    setIsSubmitting(true);

    try {
      await addAdjustmentTransaction({
        walletId,
        amountMinorUnits: signedAmount,
        date,
        note,
      });
      showToast({
        type: 'success',
        message: 'Adjustment saved.',
      });
      navigate('/transactions');
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to save adjustment.',
      });
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save adjustment.');
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
    return <PageLoadingState message="Loading form..." title="Adjust balance" />;
  }

  return (
    <section className="pf-card p-7">
      <PageHeader backTo="/transactions" title="Adjust balance" />

      <form className="mt-6 space-y-4" noValidate onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="pf-label" htmlFor="add-adjustment-wallet">
            Wallet
          </label>
          <select
            className="w-full pf-input"
            id="add-adjustment-wallet"
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

        <AdjustmentDirectionField name="adjustment-direction" onChange={setDirection} value={direction} />

        <div className="space-y-2">
          <label className="pf-label" htmlFor="add-adjustment-amount">
            Amount ({currencySymbol})
          </label>
          <input
            autoComplete="off"
            className="w-full pf-input"
            id="add-adjustment-amount"
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
          <label className="pf-label" htmlFor="add-adjustment-date">
            Date
          </label>
          <input
            className="w-full pf-input"
            id="add-adjustment-date"
            onChange={(event) => setDate(event.target.value)}
            required
            type="date"
            value={date}
          />
        </div>

        <div className="space-y-2">
          <label className="pf-label" htmlFor="add-adjustment-note">
            Note (optional)
          </label>
          <textarea
            className="min-h-24 w-full pf-input"
            id="add-adjustment-note"
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
          {isSubmitting ? 'Saving...' : 'Save adjustment'}
        </button>
      </form>
    </section>
  );
}
