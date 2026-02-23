import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showArchivedWallets, setShowArchivedWallets] = useState(false);
  const [archivingWalletId, setArchivingWalletId] = useState<string | null>(null);
  const walletSettingsQuery = useQuery({
    queryKey: ['wallet-settings'],
    queryFn: async (): Promise<{ activeWallets: WalletSummary[]; archivedWallets: WalletSummary[] }> => {
      const [activeWallets, archivedWallets] = await Promise.all([
        getAllActiveWallets(),
        getAllArchivedWallets(),
      ]);

      return { activeWallets, archivedWallets };
    },
  });
  const activeWallets = walletSettingsQuery.data?.activeWallets ?? [];
  const archivedWallets = walletSettingsQuery.data?.archivedWallets ?? [];
  const loadErrorMessage =
    walletSettingsQuery.error instanceof Error
      ? walletSettingsQuery.error.message
      : 'Unable to load wallet settings.';

  const onArchiveWallet = async (wallet: WalletSummary) => {
    setErrorMessage(null);
    setArchivingWalletId(wallet.id);

    try {
      await archiveWallet(wallet.id);
      await walletSettingsQuery.refetch();
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

  if (walletSettingsQuery.isLoading) {
    return <PageLoadingState message="Loading wallet settings..." title="Wallet management" />;
  }

  return (
    <section className="space-y-4 pf-card p-7">
      <PageHeader
        backLabel="Back to settings"
        backTo="/settings"
        rightAction={
          <Link
            className="pf-button-ghost inline-flex h-9 items-center font-medium"
            to="/settings/wallets/add">
            Add
          </Link>
        }
        title="Wallet management"
      />

      <div className="pf-soft-card flex items-center gap-2 px-4 py-3">
        <input
          checked={showArchivedWallets}
          className="pf-checkbox"
          id="wallet-settings-show-archived"
          onChange={(event) => setShowArchivedWallets(event.target.checked)}
          type="checkbox"
        />
        <label className="pf-label" htmlFor="wallet-settings-show-archived">
          Show archived wallets
        </label>
      </div>

      {errorMessage || walletSettingsQuery.error ? (
        <p className="pf-error-box">
          {errorMessage ?? loadErrorMessage}
        </p>
      ) : null}

      <div className="space-y-3">
        {activeWallets.length === 0 ? <p className="pf-muted-text text-sm">No active wallets.</p> : null}

        {activeWallets.map((wallet) => {
          const isArchiving = archivingWalletId === wallet.id;

          return (
            <article key={wallet.id} className="pf-strong-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <WalletIcon className="h-5 w-5 text-[var(--pf-text-secondary)]" iconKey={wallet.iconKey} />
                  <div>
                    <p className="font-medium">{wallet.name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    aria-label={`Edit ${wallet.name}`}
                    className="pf-icon-button h-8 w-8"
                    to={`/settings/wallets/${wallet.id}/edit`}>
                    <PencilSquareIcon aria-hidden className="h-4 w-4" />
                  </Link>
                  <button
                    aria-label={`Archive ${wallet.name}`}
                    className="pf-danger-icon-button h-8 w-8"
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
        <div className="pf-soft-card space-y-3 p-4">
          <h2 className="pf-muted-text text-sm font-semibold uppercase tracking-[0.16em]">Archived wallets</h2>
          {archivedWallets.length === 0 ? <p className="pf-muted-text text-sm">No archived wallets.</p> : null}
          {archivedWallets.map((wallet) => (
            <article
              key={wallet.id}
              className="pf-strong-card flex items-center gap-3 p-4 opacity-85">
              <WalletIcon className="h-5 w-5 text-[var(--pf-text-secondary)]" iconKey={wallet.iconKey} />
              <p className="pf-label font-medium">{wallet.name}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
