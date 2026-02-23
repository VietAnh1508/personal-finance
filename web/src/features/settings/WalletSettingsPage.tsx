import { useEffect, useState } from 'react';
import { ArchiveBoxIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { PageLoadingState } from '@/components/PageLoadingState';
import { WalletIcon } from '@/components/WalletIcon';
import { type WalletIconKey } from '@/domain/wallet-icon';
import {
  archiveWallet,
  getAllActiveWallets,
  getAllArchivedWallets,
} from '@/domain/services';
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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showArchivedWallets, setShowArchivedWallets] = useState(false);
  const [archivingWalletId, setArchivingWalletId] = useState<string | null>(null);

  const loadData = async () => {
    const [nextActiveWallets, nextArchivedWallets] = await Promise.all([
      getAllActiveWallets(),
      getAllArchivedWallets(),
    ]);

    setActiveWallets(nextActiveWallets);
    setArchivedWallets(nextArchivedWallets);
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [nextActiveWallets, nextArchivedWallets] = await Promise.all([
          getAllActiveWallets(),
          getAllArchivedWallets(),
        ]);

        if (!isMounted) {
          return;
        }

        setActiveWallets(nextActiveWallets);
        setArchivedWallets(nextArchivedWallets);
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

  const onArchiveWallet = async (wallet: WalletSummary) => {
    setErrorMessage(null);
    setArchivingWalletId(wallet.id);

    try {
      await archiveWallet(wallet.id);
      await loadData();
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
      <PageHeader
        backLabel="Back to settings"
        backTo="/settings"
        rightAction={
          <Link
            className="inline-flex h-9 items-center rounded-md border border-slate-300/20 px-3 text-sm font-medium hover:bg-slate-700/40"
            to="/settings/wallets/add">
            Add
          </Link>
        }
        title="Wallet management"
      />

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

      <div className="space-y-3">
        {activeWallets.length === 0 ? <p className="text-sm text-slate-400">No active wallets.</p> : null}

        {activeWallets.map((wallet) => {
          const isArchiving = archivingWalletId === wallet.id;

          return (
            <article key={wallet.id} className="rounded-xl border border-slate-300/20 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <WalletIcon className="h-5 w-5 text-slate-200" iconKey={wallet.iconKey} />
                  <div>
                    <p className="font-medium text-slate-100">{wallet.name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    aria-label={`Edit ${wallet.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300/20 hover:bg-slate-700/40"
                    to={`/settings/wallets/${wallet.id}/edit`}>
                    <PencilSquareIcon aria-hidden className="h-4 w-4" />
                  </Link>
                  <button
                    aria-label={`Archive ${wallet.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-300/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isArchiving}
                    onClick={() => {
                      void onArchiveWallet(wallet);
                    }}
                    type="button">
                    {isArchiving ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-100 border-t-transparent" />
                    ) : (
                      <ArchiveBoxIcon aria-hidden className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
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
