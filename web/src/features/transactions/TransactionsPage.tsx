import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { PageLoadingState } from '@/components/PageLoadingState';
import { WalletIcon } from '@/components/WalletIcon';
import type { TransactionEntry } from '@/data/repositories';
import {
  getAllActiveWallets,
  getLastUsedWalletContext,
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
import { getSelectedCurrencyOrDefault } from '@/features/shared/useSelectedCurrencyQuery';

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
  const [selectedContextOverride, setSelectedContextOverride] = useState<WalletContextValue | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const contextQuery = useQuery({
    queryKey: ['transactions-page-context'],
    queryFn: async (): Promise<{
      wallets: WalletSummary[];
      transactions: TransactionEntry[];
      selectedContext: WalletContextValue;
      currencyCode: CurrencyCode;
    }> => {
      const [activeWallets, selectedCurrency, lastUsedWalletContext, allTransactions] = await Promise.all([
        getAllActiveWallets(),
        getSelectedCurrencyOrDefault(),
        getLastUsedWalletContext(),
        getTransactionsForWalletContext('all'),
      ]);

      const normalizedContext =
        lastUsedWalletContext && activeWallets.some((wallet) => wallet.id === lastUsedWalletContext)
          ? lastUsedWalletContext
          : 'all';

      if (normalizedContext !== lastUsedWalletContext) {
        void setLastUsedWalletContext(normalizedContext).catch(() => undefined);
      }

      return {
        wallets: activeWallets,
        transactions: allTransactions,
        selectedContext: normalizedContext,
        currencyCode: selectedCurrency,
      };
    },
  });
  const wallets = contextQuery.data?.wallets ?? [];
  const transactions = contextQuery.data?.transactions ?? [];
  const selectedContext = selectedContextOverride ?? contextQuery.data?.selectedContext ?? 'all';
  const currencyCode = contextQuery.data?.currencyCode ?? 'USD';

  const currencySymbol = getCurrencySymbol(currencyCode);
  const currencyFractionDigits = getCurrencyFractionDigits(currencyCode);

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
    setSelectedContextOverride(context);
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

  if (contextQuery.isLoading) {
    return <PageLoadingState message="Loading transactions..." title="Transactions" />;
  }

  if (contextQuery.error) {
    const errorMessage =
      contextQuery.error instanceof Error ? contextQuery.error.message : 'Unable to load transactions.';

    return (
      <section className="pf-card p-7">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--pf-danger)]">Transactions</h1>
        <p className="mt-3 text-sm text-[var(--pf-danger)]">{errorMessage}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="sr-only">Transactions</h1>
      <div className="pf-card p-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="relative h-9 w-11">
            <div className="pf-icon-button pointer-events-none inline-flex h-9 w-11 items-center justify-center gap-1">
              <WalletIcon className="h-4 w-4 text-[var(--pf-text-secondary)]" iconKey={selectedWallet?.iconKey ?? 'wallet'} />
              <ChevronDownIcon className="h-3.5 w-3.5 text-[var(--pf-text-muted)]" />
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
            <p className="pf-muted-text text-xs uppercase tracking-[0.18em]">{selectedContextLabel}</p>
            <p className="text-3xl font-semibold text-[var(--pf-text-primary)]">
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

      {actionErrorMessage ? <p className="pf-error-box rounded-2xl px-4 py-3">{actionErrorMessage}</p> : null}

      <div className="space-y-3">
        {visibleTransactions.length === 0 ? (
          <div className="pf-soft-card pf-muted-text p-5 text-sm">
            No transactions yet.
          </div>
        ) : null}

        {dateSections.map((section) => (
          <article
            key={section.date}
            className="pf-soft-card overflow-hidden shadow-lg shadow-slate-950/25">
            <header className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-semibold leading-none">{section.dayNumber}</p>
                <div>
                  <p className="text-sm">{section.weekdayLabel}</p>
                  <p className="pf-muted-text text-xs">{section.monthYearLabel}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-[var(--pf-text-primary)]">
                {formatSignedMinorUnits(section.dailyNet, currencySymbol, currencyFractionDigits)}
              </p>
            </header>
            <div className="border-t border-[var(--pf-border-soft)]">
              {section.transactions.map((transaction) => {
                const signedAmount = getSignedTransactionAmount(transaction);
                const amountColor = signedAmount < 0 ? 'text-rose-200' : 'text-emerald-200';

                return (
                  <button
                    key={transaction.id}
                    className="block w-full border-b border-[var(--pf-border-soft)] px-4 py-3 text-left last:border-b-0 hover:bg-[var(--pf-surface-hover)]"
                    onClick={() => navigate(`/transactions/${transaction.id}`)}
                    type="button">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        {transaction.note ? <p className="pf-muted-text mt-1 text-xs">{transaction.note}</p> : null}
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
    </section>
  );
}
