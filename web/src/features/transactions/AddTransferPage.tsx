import { type SyntheticEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { type CurrencyCode, getCurrencySymbol } from '../../domain/currency';
import {
  addTransferTransaction,
  getAllActiveWallets,
  getLastUsedWalletContext,
  getSelectedCurrency,
} from '../../domain/services';
import { todayIsoDate } from '../../utils/date-format';
import { formatAmountInput, isValidAmountInput, parseAmountToMinorUnits } from '../../utils/money-format';
import { useToast } from '../feedback/ToastProvider';

type WalletSummary = {
  id: string;
  name: string;
};

export function AddTransferPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
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

        const preselectedFromWallet =
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
        setFromWalletId(preselectedFromWallet);
        setCurrencyCode(selectedCurrency ?? 'USD');
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load transfer form.');
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

    if (fromWalletId === toWalletId && fromWalletId) {
      setErrorMessage('From wallet and to wallet must be different.');
      return;
    }

    const normalizedAmount = parseAmountToMinorUnits(amountInput);
    if (normalizedAmount === null || normalizedAmount <= 0) {
      setErrorMessage('Amount must be greater than 0.');
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

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200/20 bg-slate-900/50 p-7 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-semibold tracking-tight">Transfer</h1>
        <p className="mt-3 text-sm text-slate-300">Loading form...</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200/20 bg-slate-900/50 p-7 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Transfer</h1>
        <Link className="rounded-md border border-slate-300/20 px-3 py-2 text-sm hover:bg-slate-700/40" to="/transactions">
          Back
        </Link>
      </div>

      <form className="mt-6 space-y-4" noValidate onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="add-transfer-from-wallet">
            From wallet
          </label>
          <select
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="add-transfer-from-wallet"
            onChange={(event) => setFromWalletId(event.target.value)}
            required
            value={fromWalletId}>
            <option value="">Select source wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="add-transfer-to-wallet">
            To wallet
          </label>
          <select
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="add-transfer-to-wallet"
            onChange={(event) => setToWalletId(event.target.value)}
            required
            value={toWalletId}>
            <option value="">Select destination wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
        </div>

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

        {errorMessage ? (
          <p className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{errorMessage}</p>
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
