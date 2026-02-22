import { type SyntheticEvent, useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { PageLoadingState } from '@/components/PageLoadingState';
import { WalletIcon } from '@/components/WalletIcon';
import { type CurrencyCode, getCurrencySymbol } from '@/domain/currency';
import { WALLET_ICON_OPTIONS, type WalletIconKey } from '@/domain/wallet-icon';
import {
  archiveWallet,
  createWallet,
  getAllActiveWallets,
  getAllArchivedWallets,
  getSelectedCurrency,
  updateWalletDetails,
} from '@/domain/services';
import { formatAmountInput, isValidAmountInput, parseAmountToMinorUnits } from '@/utils/money-format';
import { useToast } from '@/features/feedback/ToastProvider';

type WalletSummary = {
  id: string;
  name: string;
  initialBalance: number;
  iconKey: WalletIconKey;
};

export function WalletSettingsPage() {
  const { showToast } = useToast();
  const [activeWallets, setActiveWallets] = useState<WalletSummary[]>([]);
  const [archivedWallets, setArchivedWallets] = useState<WalletSummary[]>([]);
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showArchivedWallets, setShowArchivedWallets] = useState(false);

  const [createName, setCreateName] = useState('');
  const [createInitialBalance, setCreateInitialBalance] = useState('');
  const [createIconKey, setCreateIconKey] = useState<WalletIconKey>('wallet');
  const [isCreating, setIsCreating] = useState(false);

  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIconKey, setEditIconKey] = useState<WalletIconKey>('wallet');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [archivingWalletId, setArchivingWalletId] = useState<string | null>(null);

  const currencySymbol = getCurrencySymbol(currencyCode);

  const loadData = async () => {
    const [nextActiveWallets, nextArchivedWallets, selectedCurrency] = await Promise.all([
      getAllActiveWallets(),
      getAllArchivedWallets(),
      getSelectedCurrency(),
    ]);

    setActiveWallets(nextActiveWallets);
    setArchivedWallets(nextArchivedWallets);
    setCurrencyCode(selectedCurrency ?? 'USD');
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [nextActiveWallets, nextArchivedWallets, selectedCurrency] = await Promise.all([
          getAllActiveWallets(),
          getAllArchivedWallets(),
          getSelectedCurrency(),
        ]);

        if (!isMounted) {
          return;
        }

        setActiveWallets(nextActiveWallets);
        setArchivedWallets(nextArchivedWallets);
        setCurrencyCode(selectedCurrency ?? 'USD');
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load wallet settings.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const onCreateInitialBalanceChange = (nextValue: string) => {
    const normalized = nextValue.replace(/,/g, '');
    if (!isValidAmountInput(normalized)) {
      return;
    }

    setCreateInitialBalance(formatAmountInput(normalized));
  };

  const onCreateWallet = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsedBalance = parseAmountToMinorUnits(createInitialBalance);
    if (parsedBalance === null) {
      setErrorMessage('Initial balance must be a valid amount.');
      return;
    }

    setIsCreating(true);

    try {
      await createWallet(createName, parsedBalance, createIconKey);
      await loadData();
      setCreateName('');
      setCreateInitialBalance('');
      setCreateIconKey('wallet');
      showToast({
        type: 'success',
        message: 'Wallet created successfully.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create wallet.';
      setErrorMessage(message);
      showToast({
        type: 'error',
        message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const onStartEditWallet = (wallet: WalletSummary) => {
    setEditingWalletId(wallet.id);
    setEditName(wallet.name);
    setEditIconKey(wallet.iconKey);
  };

  const onCancelEditWallet = () => {
    setEditingWalletId(null);
    setEditName('');
    setEditIconKey('wallet');
  };

  const onSaveEditWallet = async (walletId: string) => {
    setErrorMessage(null);
    setIsSavingEdit(true);

    try {
      await updateWalletDetails(walletId, editName, editIconKey);
      await loadData();
      onCancelEditWallet();
      showToast({
        type: 'success',
        message: 'Wallet updated successfully.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update wallet.';
      setErrorMessage(message);
      showToast({
        type: 'error',
        message,
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const onArchiveWallet = async (wallet: WalletSummary) => {
    setErrorMessage(null);
    setArchivingWalletId(wallet.id);

    try {
      await archiveWallet(wallet.id);
      await loadData();
      if (editingWalletId === wallet.id) {
        onCancelEditWallet();
      }
      showToast({
        type: 'success',
        message: 'Wallet archived successfully.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to archive wallet.';
      setErrorMessage(message);
      showToast({
        type: 'error',
        message,
      });
    } finally {
      setArchivingWalletId(null);
    }
  };

  if (isLoading) {
    return <PageLoadingState message="Loading wallet settings..." title="Wallet management" />;
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200/20 bg-slate-900/50 p-7 shadow-xl backdrop-blur">
      <PageHeader backLabel="Back to settings" backTo="/settings" title="Wallet management" />

      <form className="space-y-4 rounded-2xl border border-slate-300/20 bg-slate-900/35 p-4" noValidate onSubmit={onCreateWallet}>
        <p className="text-sm font-semibold text-slate-100">Create wallet</p>

        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="wallet-settings-create-name">
            Wallet name
          </label>
          <input
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="wallet-settings-create-name"
            maxLength={60}
            onChange={(event) => setCreateName(event.target.value)}
            placeholder="e.g. Daily Cash"
            value={createName}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-200" htmlFor="wallet-settings-create-initial-balance">
            Initial balance ({currencySymbol})
          </label>
          <input
            className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
            id="wallet-settings-create-initial-balance"
            inputMode="decimal"
            onChange={(event) => onCreateInitialBalanceChange(event.target.value)}
            placeholder="0.00"
            value={createInitialBalance}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm text-slate-200">Wallet icon</legend>
          <div className="grid grid-cols-5 gap-2">
            {WALLET_ICON_OPTIONS.map((iconOption) => {
              const isSelected = createIconKey === iconOption.key;
              return (
                <button
                  key={iconOption.key}
                  aria-label={`Select ${iconOption.label} icon for new wallet`}
                  className={`rounded-xl border p-2 text-xs transition ${
                    isSelected
                      ? 'border-emerald-300 bg-emerald-300/10 ring-2 ring-emerald-300/40'
                      : 'border-slate-300/25 bg-slate-900/55 hover:border-amber-300/45'
                  }`}
                  onClick={() => setCreateIconKey(iconOption.key)}
                  type="button">
                  <WalletIcon className="mx-auto h-4 w-4" iconKey={iconOption.key} />
                  <p className="mt-1">{iconOption.label}</p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <button
          className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          disabled={isCreating}
          type="submit">
          {isCreating ? 'Creating...' : 'Create wallet'}
        </button>
      </form>

      <div className="flex items-center gap-2 rounded-2xl border border-slate-300/20 bg-slate-900/35 px-4 py-3">
        <input
          checked={showArchivedWallets}
          className="accent-amber-300"
          id="wallet-settings-show-archived"
          onChange={(event) => setShowArchivedWallets(event.target.checked)}
          type="checkbox"
        />
        <label className="text-sm text-slate-200" htmlFor="wallet-settings-show-archived">
          Show archived wallets
        </label>
      </div>

      {errorMessage ? (
        <p className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{errorMessage}</p>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-slate-300/20 bg-slate-900/35 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Active wallets</h2>

        {activeWallets.length === 0 ? <p className="text-sm text-slate-400">No active wallets.</p> : null}

        {activeWallets.map((wallet) => {
          const isEditing = editingWalletId === wallet.id;
          const isArchiving = archivingWalletId === wallet.id;

          return (
            <article key={wallet.id} className="rounded-xl border border-slate-300/20 bg-slate-900/60 p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-200" htmlFor="wallet-settings-edit-name">
                      Edit wallet name
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
                      id="wallet-settings-edit-name"
                      onChange={(event) => setEditName(event.target.value)}
                      value={editName}
                    />
                  </div>

                  <fieldset className="space-y-2">
                    <legend className="text-sm text-slate-200">Edit wallet icon</legend>
                    <div className="grid grid-cols-5 gap-2">
                      {WALLET_ICON_OPTIONS.map((iconOption) => {
                        const isSelected = editIconKey === iconOption.key;
                        return (
                          <button
                            key={iconOption.key}
                            aria-label={`Select ${iconOption.label} icon for edit`}
                            className={`rounded-xl border p-2 text-xs transition ${
                              isSelected
                                ? 'border-emerald-300 bg-emerald-300/10 ring-2 ring-emerald-300/40'
                                : 'border-slate-300/25 bg-slate-900/55 hover:border-amber-300/45'
                            }`}
                            onClick={() => setEditIconKey(iconOption.key)}
                            type="button">
                            <WalletIcon className="mx-auto h-4 w-4" iconKey={iconOption.key} />
                            <p className="mt-1">{iconOption.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-xl bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                      disabled={isSavingEdit}
                      onClick={() => {
                        void onSaveEditWallet(wallet.id);
                      }}
                      type="button">
                      {isSavingEdit ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                      className="rounded-xl border border-slate-300/20 px-3 py-2 text-sm hover:bg-slate-700/40"
                      onClick={onCancelEditWallet}
                      type="button">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <WalletIcon className="h-5 w-5 text-slate-200" iconKey={wallet.iconKey} />
                    <div>
                      <p className="font-medium text-slate-100">{wallet.name}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      aria-label={`Edit ${wallet.name}`}
                      className="rounded-xl border border-slate-300/20 px-3 py-2 text-sm hover:bg-slate-700/40"
                      onClick={() => onStartEditWallet(wallet)}
                      type="button">
                      Edit
                    </button>
                    <button
                      aria-label={`Archive ${wallet.name}`}
                      className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isArchiving}
                      onClick={() => {
                        void onArchiveWallet(wallet);
                      }}
                      type="button">
                      {isArchiving ? 'Archiving...' : 'Archive'}
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {showArchivedWallets ? (
        <div className="space-y-3 rounded-2xl border border-slate-300/20 bg-slate-900/35 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">Archived wallets</h2>
          {archivedWallets.length === 0 ? <p className="text-sm text-slate-400">No archived wallets.</p> : null}
          {archivedWallets.map((wallet) => (
            <article
              key={wallet.id}
              className="flex items-center gap-3 rounded-xl border border-slate-300/20 bg-slate-900/60 p-4 opacity-85">
              <WalletIcon className="h-5 w-5 text-slate-200" iconKey={wallet.iconKey} />
              <p className="font-medium text-slate-200">{wallet.name}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
