import { useQuery } from '@tanstack/react-query';
import { type SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { PageLoadingState } from '@/components/PageLoadingState';
import { getCurrencySymbol } from '@/domain/currency';
import {
  addTransferTransaction,
  getAllActiveWallets,
  getLastUsedWalletContext,
  getSignedTransactionAmount,
  getTransactionsForWalletContext,
} from '@/domain/services';
import { WalletSelectField } from '@/features/transactions/WalletSelectField';
import { getSelectedCurrencyOrDefault } from '@/features/shared/useSelectedCurrencyQuery';
import { todayIsoDate } from '@/utils/date-format';
import { formatAmountInput, isValidAmountInput, parseAmountToMinorUnits } from '@/utils/money-format';
import { useToast } from '@/features/feedback/ToastProvider';

export function AddTransferPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [fromWalletIdOverride, setFromWalletIdOverride] = useState<string | null>(null);
  const [toWalletId, setToWalletId] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formContextQuery = useQuery({
    queryKey: ['transfer-form-context'],
    queryFn: async () => {
      const [selectedContext, selectedCurrency, wallets, transactions] = await Promise.all([
        getLastUsedWalletContext(),
        getSelectedCurrencyOrDefault(),
        getAllActiveWallets(),
        getTransactionsForWalletContext('all'),
      ]);

      const walletBalanceById: Record<string, number> = Object.fromEntries(
        wallets.map((wallet) => [wallet.id, wallet.initialBalance])
      );
      for (const transaction of transactions) {
        walletBalanceById[transaction.walletId] =
          (walletBalanceById[transaction.walletId] ?? 0) + getSignedTransactionAmount(transaction);
      }

      return {
        preselectedFromWalletId: selectedContext && selectedContext !== 'all' ? selectedContext : '',
        currencyCode: selectedCurrency,
        walletBalanceById,
      };
    },
  });
  const fromWalletId = fromWalletIdOverride ?? formContextQuery.data?.preselectedFromWalletId ?? '';
  const walletBalanceById = formContextQuery.data?.walletBalanceById ?? {};

  const currencySymbol = getCurrencySymbol(formContextQuery.data?.currencyCode ?? 'USD');
  const loadErrorMessage =
    formContextQuery.error instanceof Error ? formContextQuery.error.message : 'Unable to load transfer form.';

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (fromWalletId === toWalletId && fromWalletId) {
      setErrorMessage('From wallet and to wallet must be different.');
      return;
    }

    const normalizedAmount = parseAmountToMinorUnits(amountInput);
    if (normalizedAmount === null || normalizedAmount <= 0) {
      setErrorMessage('Amount must be greater than 0.');
      return;
    }

    const fromWalletBalance = walletBalanceById[fromWalletId] ?? null;
    if (fromWalletBalance !== null && fromWalletBalance <= 0) {
      setErrorMessage('From wallet balance must be greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      await addTransferTransaction({
        fromWalletId,
        toWalletId,
        amountMinorUnits: normalizedAmount,
        date,
        note,
      });
      showToast({
        type: 'success',
        message: 'Transfer saved.',
      });
      navigate('/transactions');
    } catch (error) {
      showToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to save transfer.',
      });
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save transfer.');
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
    return <PageLoadingState message="Loading form..." title="Transfer" />;
  }

  return (
    <section className="rounded-3xl border border-slate-200/20 bg-slate-900/50 p-7 shadow-xl backdrop-blur">
      <PageHeader backTo="/transactions" title="Transfer" />

      <form className="mt-6 space-y-4" noValidate onSubmit={onSubmit}>
        <WalletSelectField
          id="add-transfer-from-wallet"
          label="From wallet"
          onChange={setFromWalletIdOverride}
          onLoadError={(message) => setErrorMessage(message)}
          placeholder="Select source wallet"
          value={fromWalletId}
        />

        <WalletSelectField
          id="add-transfer-to-wallet"
          label="To wallet"
          onChange={setToWalletId}
          onLoadError={(message) => setErrorMessage(message)}
          placeholder="Select destination wallet"
          value={toWalletId}
        />

        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="add-transfer-amount">
            Amount ({currencySymbol})
          </label>
          <input
            autoComplete="off"
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="add-transfer-amount"
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
          <label className="text-sm text-slate-200" htmlFor="add-transfer-date">
            Date
          </label>
          <input
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="add-transfer-date"
            onChange={(event) => setDate(event.target.value)}
            required
            type="date"
            value={date}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="add-transfer-note">
            Note (optional)
          </label>
          <textarea
            className="min-h-24 w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="add-transfer-note"
            onChange={(event) => setNote(event.target.value)}
            value={note}
          />
        </div>

        {errorMessage || formContextQuery.error ? (
          <p className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
            {errorMessage ?? loadErrorMessage}
          </p>
        ) : null}

        <button
          className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          disabled={isSubmitting}
          type="submit">
          {isSubmitting ? 'Saving...' : 'Save transfer'}
        </button>
      </form>
    </section>
  );
}
