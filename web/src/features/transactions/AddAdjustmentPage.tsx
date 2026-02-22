import { type SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { PageLoadingState } from '@/components/PageLoadingState';
import { type CurrencyCode, getCurrencySymbol } from '@/domain/currency';
import {
  addAdjustmentTransaction,
  getAllActiveWallets,
  getLastUsedWalletContext,
  getSelectedCurrency,
} from '@/domain/services';
import { todayIsoDate } from '@/utils/date-format';
import { formatAmountInput, isValidAmountInput, parseAmountToMinorUnits } from '@/utils/money-format';
import { useToast } from '@/features/feedback/ToastProvider';
import {
  AdjustmentDirectionField,
  type AdjustmentDirection,
} from '@/features/transactions/AdjustmentDirectionField';

type WalletSummary = {
  id: string;
  name: string;
};

export function AddAdjustmentPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [walletId, setWalletId] = useState('');
  const [direction, setDirection] = useState<AdjustmentDirection>('increase');
  const [amountInput, setAmountInput] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [note, setNote] = useState('');
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currencySymbol = getCurrencySymbol(currencyCode);

  useEffect(() => {
    let isMounted = true;

    const loadFormContext = async () => {
      try {
        const [activeWallets, selectedContext, selectedCurrency] = await Promise.all([
          getAllActiveWallets(),
          getLastUsedWalletContext(),
          getSelectedCurrency(),
        ]);

        const preselectedWallet =
          selectedContext && selectedContext !== 'all' && activeWallets.some((wallet) => wallet.id === selectedContext)
            ? selectedContext
            : '';

        if (!isMounted) {
          return;
        }

        setWallets(
          activeWallets.map((wallet) => ({
            id: wallet.id,
            name: wallet.name,
          }))
        );
        setWalletId(preselectedWallet);
        setCurrencyCode(selectedCurrency ?? 'USD');
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load adjustment form.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadFormContext();

    return () => {
      isMounted = false;
    };
  }, []);

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

  if (isLoading) {
    return <PageLoadingState message="Loading form..." title="Adjust balance" />;
  }

  return (
    <section className="rounded-3xl border border-slate-200/20 bg-slate-900/50 p-7 shadow-xl backdrop-blur">
      <PageHeader backTo="/transactions" title="Adjust balance" />

      <form className="mt-6 space-y-4" noValidate onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="add-adjustment-wallet">
            Wallet
          </label>
          <select
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="add-adjustment-wallet"
            onChange={(event) => setWalletId(event.target.value)}
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
          <label className="text-sm text-slate-200" htmlFor="add-adjustment-amount">
            Amount ({currencySymbol})
          </label>
          <input
            autoComplete="off"
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
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
          <label className="text-sm text-slate-200" htmlFor="add-adjustment-date">
            Date
          </label>
          <input
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="add-adjustment-date"
            onChange={(event) => setDate(event.target.value)}
            required
            type="date"
            value={date}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="add-adjustment-note">
            Note (optional)
          </label>
          <textarea
            className="min-h-24 w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="add-adjustment-note"
            onChange={(event) => setNote(event.target.value)}
            value={note}
          />
        </div>

        {errorMessage ? (
          <p className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{errorMessage}</p>
        ) : null}

        <button
          className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          disabled={isSubmitting}
          type="submit">
          {isSubmitting ? 'Saving...' : 'Save adjustment'}
        </button>
      </form>
    </section>
  );
}
