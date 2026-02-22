import { type SyntheticEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { PageLoadingState } from '@/components/PageLoadingState';
import { type CurrencyCode, getCurrencySymbol } from '@/domain/currency';
import {
  deleteTransactionById,
  editAdjustmentTransaction,
  editIncomeExpenseTransaction,
  editTransferTransaction,
  getSelectedCurrency,
  getTransactionDetailById,
  type EditableTransactionDetail,
} from '@/domain/services';
import { type IncomeExpenseTransactionType } from '@/domain/transaction-type';
import { useToast } from '@/features/feedback/ToastProvider';
import {
  AdjustmentDirectionField,
  type AdjustmentDirection,
} from '@/features/transactions/AdjustmentDirectionField';
import { IncomeExpenseTypeField } from '@/features/transactions/IncomeExpenseTypeField';
import { WalletSelectField } from '@/features/transactions/WalletSelectField';
import { formatAmountInput, isValidAmountInput, parseAmountToMinorUnits } from '@/utils/money-format';

function formatMinorUnitsForInput(amountMinorUnits: number): string {
  return formatAmountInput(`${Math.abs(amountMinorUnits) / 100}`);
}

export function TransactionDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [transactionDetail, setTransactionDetail] = useState<EditableTransactionDetail | null>(null);
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');

  const [walletId, setWalletId] = useState('');
  const [type, setType] = useState<IncomeExpenseTransactionType>('expense');
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [direction, setDirection] = useState<AdjustmentDirection>('increase');
  const [category, setCategory] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currencySymbol = getCurrencySymbol(currencyCode);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [selectedCurrency, detail] = await Promise.all([getSelectedCurrency(), getTransactionDetailById(id)]);

        if (!isMounted) {
          return;
        }

        if (!detail) {
          setErrorMessage('Transaction not found.');
          return;
        }

        setCurrencyCode(selectedCurrency ?? 'USD');
        setTransactionDetail(detail);

        if (detail.kind === 'income_expense') {
          setWalletId(detail.walletId);
          setType(detail.type);
          setCategory(detail.category);
          setAmountInput(formatMinorUnitsForInput(detail.amountMinorUnits));
          setDate(detail.date);
          setNote(detail.note);
          return;
        }

        if (detail.kind === 'adjustment') {
          setWalletId(detail.walletId);
          setDirection(detail.amountMinorUnits < 0 ? 'decrease' : 'increase');
          setAmountInput(formatMinorUnitsForInput(detail.amountMinorUnits));
          setDate(detail.date);
          setNote(detail.note);
          return;
        }

        setFromWalletId(detail.fromWalletId);
        setToWalletId(detail.toWalletId);
        setAmountInput(formatMinorUnitsForInput(detail.amountMinorUnits));
        setDate(detail.date);
        setNote(detail.note);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load transaction detail.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

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

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!transactionDetail) {
      setErrorMessage('Transaction not found.');
      return;
    }

    const parsedAmount = parseAmountToMinorUnits(amountInput);
    if (parsedAmount === null || parsedAmount <= 0) {
      setErrorMessage('Amount must be greater than 0.');
      return;
    }

    if (transactionDetail.kind === 'transfer' && fromWalletId === toWalletId && fromWalletId) {
      setErrorMessage('From wallet and to wallet must be different.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (transactionDetail.kind === 'income_expense') {
        await editIncomeExpenseTransaction({
          id: transactionDetail.id,
          walletId,
          type,
          amountMinorUnits: parsedAmount,
          category,
          date,
          note,
        });
      } else if (transactionDetail.kind === 'adjustment') {
        const signedAmount = direction === 'decrease' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
        await editAdjustmentTransaction({
          id: transactionDetail.id,
          walletId,
          amountMinorUnits: signedAmount,
          date,
          note,
        });
      } else {
        await editTransferTransaction({
          transferId: transactionDetail.transferId,
          fromWalletId,
          toWalletId,
          amountMinorUnits: parsedAmount,
          date,
          note,
        });
      }

      showToast({
        type: 'success',
        message: 'Transaction updated.',
      });
      navigate('/transactions');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update transaction.';
      setErrorMessage(message);
      showToast({
        type: 'error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    setErrorMessage(null);

    if (!transactionDetail) {
      setErrorMessage('Transaction not found.');
      return;
    }

    const shouldDelete = window.confirm('Delete this transaction?');
    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTransactionById(transactionDetail.id);
      showToast({
        type: 'success',
        message: 'Transaction deleted.',
      });
      navigate('/transactions');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete transaction.';
      setErrorMessage(message);
      showToast({
        type: 'error',
        message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <PageLoadingState message="Loading transaction..." title="Transaction detail" />;
  }

  if (!transactionDetail) {
    return (
      <section className="rounded-3xl border border-rose-300/30 bg-rose-500/10 p-7 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-rose-100">Transaction detail</h1>
        <p className="mt-3 text-sm text-rose-200">{errorMessage ?? 'Transaction not found.'}</p>
        <Link className="mt-4 inline-block rounded-md border border-slate-300/20 px-3 py-2 text-sm hover:bg-slate-700/40" to="/transactions">
          Back to transactions
        </Link>
      </section>
    );
  }

  const heading =
    transactionDetail.kind === 'transfer'
      ? 'Edit transfer'
      : transactionDetail.kind === 'adjustment'
        ? 'Edit adjustment'
        : 'Edit transaction';

  return (
    <section className="rounded-3xl border border-slate-200/20 bg-slate-900/50 p-7 shadow-xl backdrop-blur">
      <PageHeader backTo="/transactions" title={heading} />

      <form className="mt-6 space-y-4" noValidate onSubmit={onSubmit}>
        {transactionDetail.kind === 'transfer' ? (
          <>
            <WalletSelectField
              id="transaction-detail-from-wallet"
              label="From wallet"
              onChange={setFromWalletId}
              onLoadError={(message) => setErrorMessage(message)}
              placeholder="Select source wallet"
              value={fromWalletId}
            />

            <WalletSelectField
              id="transaction-detail-to-wallet"
              label="To wallet"
              onChange={setToWalletId}
              onLoadError={(message) => setErrorMessage(message)}
              placeholder="Select destination wallet"
              value={toWalletId}
            />
          </>
        ) : (
          <WalletSelectField
            id="transaction-detail-wallet"
            label="Wallet"
            onChange={setWalletId}
            onLoadError={(message) => setErrorMessage(message)}
            placeholder="Select wallet"
            value={walletId}
          />
        )}

        {transactionDetail.kind === 'income_expense' ? (
          <IncomeExpenseTypeField id="transaction-detail-type" onChange={setType} value={type} />
        ) : null}

        {transactionDetail.kind === 'adjustment' ? (
          <AdjustmentDirectionField
            name="transaction-detail-adjustment-direction"
            onChange={setDirection}
            value={direction}
          />
        ) : null}

        {transactionDetail.kind === 'income_expense' ? (
          <div className="space-y-2">
            <label className="text-sm text-slate-200" htmlFor="transaction-detail-category">
              Category
            </label>
            <input
              className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
              id="transaction-detail-category"
              onChange={(event) => setCategory(event.target.value)}
              required
              value={category}
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="transaction-detail-amount">
            Amount ({currencySymbol})
          </label>
          <input
            autoComplete="off"
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="transaction-detail-amount"
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
          <label className="text-sm text-slate-200" htmlFor="transaction-detail-date">
            Date
          </label>
          <input
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="transaction-detail-date"
            onChange={(event) => setDate(event.target.value)}
            required
            type="date"
            value={date}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="transaction-detail-note">
            Note (optional)
          </label>
          <textarea
            className="min-h-24 w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="transaction-detail-note"
            onChange={(event) => setNote(event.target.value)}
            value={note}
          />
        </div>

        {errorMessage ? (
          <p className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{errorMessage}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            disabled={isSubmitting || isDeleting}
            type="submit">
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
          <button
            className="rounded-xl border border-rose-300/35 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:border-slate-400/20 disabled:text-slate-400"
            disabled={isSubmitting || isDeleting}
            onClick={() => {
              void onDelete();
            }}
            type="button">
            {isDeleting ? 'Deleting...' : 'Delete transaction'}
          </button>
        </div>
      </form>
    </section>
  );
}
