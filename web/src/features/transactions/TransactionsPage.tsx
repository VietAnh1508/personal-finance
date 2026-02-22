import { useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import { PageLoadingState } from '@/components/PageLoadingState';
import { WalletIcon } from '@/components/WalletIcon';
import type { TransactionEntry } from '@/data/repositories';
import {
  getAllActiveWallets,
  getLastUsedWalletContext,
  getSelectedCurrency,
  getSignedTransactionAmount,
  getTransactionsForWalletContext,
  setLastUsedWalletContext,
} from '@/domain/services';
import { type CurrencyCode, getCurrencyFractionDigits, getCurrencySymbol } from '@/domain/currency';
import type { WalletIconKey } from '@/domain/wallet-icon';
import {
  formatIsoDateDayNumber,
  formatIsoDateMonthYear,
  formatIsoDateWeekday,
} from '@/utils/date-format';
import { formatMinorUnits, formatSignedMinorUnits } from '@/utils/money-format';
import {
  type TransactionHeaderAction,
  TransactionsHeaderActionsMenu,
} from '@/features/transactions/TransactionsHeaderActionsMenu';

type WalletContextValue = 'all' | string;

type WalletSummary = {
  id: string;
  name: string;
  initialBalance: number;
  iconKey: WalletIconKey;
};

type DateSection = {
  date: string;
  dayNumber: string;
  weekdayLabel: string;
  monthYearLabel: string;
  dailyNet: number;
  transactions: TransactionEntry[];
};

export function TransactionsPage() {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<WalletSummary[]>([]);
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [selectedContext, setSelectedContext] = useState<WalletContextValue>('all');
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  const currencySymbol = getCurrencySymbol(currencyCode);
  const currencyFractionDigits = getCurrencyFractionDigits(currencyCode);

  useEffect(() => {
    let isMounted = true;

    const loadContextData = async () => {
      try {
        const [activeWallets, selectedCurrency, lastUsedWalletContext] = await Promise.all([
          getAllActiveWallets(),
          getSelectedCurrency(),
          getLastUsedWalletContext(),
        ]);
        const allTransactions = await getTransactionsForWalletContext('all');

        const normalizedContext =
          lastUsedWalletContext && activeWallets.some((wallet) => wallet.id === lastUsedWalletContext)
            ? lastUsedWalletContext
            : 'all';

        if (normalizedContext !== lastUsedWalletContext) {
          void setLastUsedWalletContext(normalizedContext).catch(() => undefined);
        }

        if (isMounted) {
          setWallets(activeWallets);
          setTransactions(allTransactions);
          setCurrencyCode(selectedCurrency ?? 'USD');
          setSelectedContext(normalizedContext);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load transactions.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadContextData();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedWallet = wallets.find((wallet) => wallet.id === selectedContext) ?? null;

  const netByWalletId = useMemo(() => {
    const result: Record<string, number> = {};
    for (const transaction of transactions) {
      const signedAmount = getSignedTransactionAmount(transaction);
      result[transaction.walletId] = (result[transaction.walletId] ?? 0) + signedAmount;
    }

    return result;
  }, [transactions]);

  const visibleTransactions = useMemo(() => {
    if (selectedContext === 'all') {
      return transactions;
    }

    return transactions.filter((transaction) => transaction.walletId === selectedContext);
  }, [selectedContext, transactions]);

  const dateSections = useMemo<DateSection[]>(() => {
    const sectionsByDate = new Map<string, DateSection>();

    for (const transaction of visibleTransactions) {
      const signedAmount = getSignedTransactionAmount(transaction);
      const existingSection = sectionsByDate.get(transaction.date);

      if (existingSection) {
        existingSection.transactions.push(transaction);
        existingSection.dailyNet += signedAmount;
        continue;
      }

      sectionsByDate.set(transaction.date, {
        date: transaction.date,
        dayNumber: formatIsoDateDayNumber(transaction.date),
        weekdayLabel: formatIsoDateWeekday(transaction.date),
        monthYearLabel: formatIsoDateMonthYear(transaction.date),
        dailyNet: signedAmount,
        transactions: [transaction],
      });
    }

    return Array.from(sectionsByDate.values());
  }, [visibleTransactions]);

  const displayedTotalMinorUnits =
    selectedContext === 'all'
      ? wallets.reduce((total, wallet) => total + wallet.initialBalance + (netByWalletId[wallet.id] ?? 0), 0)
      : (selectedWallet?.initialBalance ?? 0) + (selectedWallet ? (netByWalletId[selectedWallet.id] ?? 0) : 0);
  const selectedWalletCurrentBalanceMinorUnits =
    selectedWallet ? selectedWallet.initialBalance + (netByWalletId[selectedWallet.id] ?? 0) : null;
  const isTransferDisabledForSelectedWallet =
    selectedContext !== 'all' &&
    selectedWalletCurrentBalanceMinorUnits !== null &&
    selectedWalletCurrentBalanceMinorUnits <= 0;
  const selectedContextLabel = selectedContext === 'all' ? 'All Wallets' : (selectedWallet?.name ?? 'Wallet');

  const onSelectWalletContext = (context: WalletContextValue) => {
    setSelectedContext(context);
    void setLastUsedWalletContext(context).catch(() => undefined);
  };

  const onSelectHeaderAction = (action: TransactionHeaderAction) => {
    if (action === 'transfer' && wallets.length < 2) {
      setActionErrorMessage('At least two active wallets are required for transfer.');
      return;
    }

    if (action === 'transfer' && isTransferDisabledForSelectedWallet) {
      setActionErrorMessage('Selected wallet balance must be greater than 0 to start a transfer.');
      return;
    }

    setActionErrorMessage(null);
    navigate(action === 'transfer' ? '/transactions/transfer' : '/transactions/adjustment');
  };

  if (isLoading) {
    return <PageLoadingState message="Loading transactions..." title="Transactions" />;
  }

  if (errorMessage) {
    return (
      <section className="rounded-3xl border border-rose-300/30 bg-rose-500/10 p-7 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-rose-100">Transactions</h1>
        <p className="mt-3 text-sm text-rose-200">{errorMessage}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="sr-only">Transactions</h1>
      <div className="rounded-3xl border border-slate-200/20 bg-slate-900/50 p-6 shadow-xl backdrop-blur">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="relative h-9 w-11">
            <div className="pointer-events-none inline-flex h-9 w-11 items-center justify-center gap-1 rounded-md border border-slate-300/20 bg-slate-900/70">
              <WalletIcon className="h-4 w-4 text-slate-200" iconKey={selectedWallet?.iconKey ?? 'wallet'} />
              <ChevronDownIcon className="h-3.5 w-3.5 text-slate-300" />
            </div>
            <label className="sr-only" htmlFor="wallet-context">
              Select wallet context
            </label>
            <select
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              id="wallet-context"
              onChange={(event) => onSelectWalletContext(event.target.value)}
              value={selectedContext}>
              <option value="all">All Wallets</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{selectedContextLabel}</p>
            <p className="text-3xl font-semibold text-amber-200">
              {formatMinorUnits(displayedTotalMinorUnits, currencySymbol, currencyFractionDigits)}
            </p>
          </div>

          <TransactionsHeaderActionsMenu
            isTransferDisabled={isTransferDisabledForSelectedWallet}
            onSelectAction={(action) => {
              setActionErrorMessage(null);
              onSelectHeaderAction(action);
            }}
          />
        </div>
      </div>

      {actionErrorMessage ? (
        <p className="rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{actionErrorMessage}</p>
      ) : null}

      <div className="space-y-3">
        {visibleTransactions.length === 0 ? (
          <div className="rounded-2xl border border-slate-300/20 bg-slate-900/40 p-5 text-sm text-slate-300">
            No transactions yet.
          </div>
        ) : null}

        {dateSections.map((section) => (
          <article
            key={section.date}
            className="overflow-hidden rounded-2xl border border-slate-300/20 bg-slate-900/40 shadow-lg shadow-slate-950/25">
            <header className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-semibold leading-none text-slate-100">{section.dayNumber}</p>
                <div>
                  <p className="text-sm text-slate-100">{section.weekdayLabel}</p>
                  <p className="text-xs text-slate-400">{section.monthYearLabel}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {formatSignedMinorUnits(section.dailyNet, currencySymbol, currencyFractionDigits)}
              </p>
            </header>
            <div className="border-t border-slate-300/15">
              {section.transactions.map((transaction) => {
                const signedAmount = getSignedTransactionAmount(transaction);
                const amountColor = signedAmount < 0 ? 'text-rose-300' : 'text-emerald-300';

                return (
                  <button
                    key={transaction.id}
                    className="block w-full border-b border-slate-300/10 px-4 py-3 text-left last:border-b-0 hover:bg-slate-700/20"
                    onClick={() => navigate(`/transactions/${transaction.id}`)}
                    type="button">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-100">{transaction.category}</p>
                        {transaction.note ? <p className="mt-1 text-xs text-slate-400">{transaction.note}</p> : null}
                      </div>
                      <p className={`text-sm font-semibold ${amountColor}`}>
                        {formatMinorUnits(Math.abs(signedAmount), currencySymbol, currencyFractionDigits)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link className="rounded-md border border-slate-300/20 px-3 py-2 text-sm hover:bg-slate-700/40" to="/transactions/add">
          Add Transaction
        </Link>
      </div>
    </section>
  );
}
