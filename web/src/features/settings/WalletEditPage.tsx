import { useMutation, useQuery } from '@tanstack/react-query';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { PageLoadingState } from '@/components/PageLoadingState';
import { type WalletIconKey } from '@/domain/wallet-icon';
import { getAllActiveWallets, updateWalletDetails } from '@/domain/services';
import { useToast } from '@/features/feedback/ToastProvider';
import { WalletForm } from '@/features/settings/WalletForm';

export function WalletEditPage() {
  const { walletId = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [walletName, setWalletName] = useState('');
  const [walletIconKey, setWalletIconKey] = useState<WalletIconKey>('wallet');
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  const walletsQuery = useQuery({
    queryKey: ['active-wallets'],
    queryFn: getAllActiveWallets,
  });

  const wallet = walletsQuery.data?.find((entry) => entry.id === walletId) ?? null;

  const updateWalletMutation = useMutation({
    mutationFn: async (params: { id: string; name: string; iconKey: WalletIconKey }) =>
      updateWalletDetails(params.id, params.name, params.iconKey),
    onSuccess: () => {
      showToast({
        type: 'success',
        message: 'Wallet updated successfully.',
      });
      navigate('/settings/wallets');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unable to update wallet.';
      setFormErrorMessage(message);
      showToast({
        type: 'error',
        message,
      });
    },
  });

  useEffect(() => {
    if (!wallet) {
      return;
    }

    setWalletName(wallet.name);
    setWalletIconKey(wallet.iconKey);
  }, [wallet]);

  const onSaveWallet = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();

    if (!wallet) {
      setFormErrorMessage('Wallet not found.');
      return;
    }

    setFormErrorMessage(null);
    await updateWalletMutation.mutateAsync({
      id: wallet.id,
      name: walletName,
      iconKey: walletIconKey,
    });
  };

  if (walletsQuery.isLoading) {
    return <PageLoadingState message="Loading form..." title="Edit wallet" />;
  }

  const pageErrorMessage =
    formErrorMessage ??
    (walletsQuery.error instanceof Error ? walletsQuery.error.message : null) ??
    (wallet ? null : 'Wallet not found.');

  if (!wallet) {
    return (
      <section className="rounded-3xl border border-rose-300/30 bg-rose-500/10 p-7 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight text-rose-100">Edit wallet</h1>
        <p className="mt-3 text-sm text-rose-200">{pageErrorMessage}</p>
        <Link className="mt-4 inline-block rounded-md border border-slate-300/20 px-3 py-2 text-sm hover:bg-slate-700/40" to="/settings/wallets">
          Back to wallet management
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200/20 bg-slate-900/50 p-7 shadow-xl backdrop-blur">
      <PageHeader backLabel="Back to wallet management" backTo="/settings/wallets" title="Edit wallet" />

      <WalletForm
        errorMessage={formErrorMessage}
        isSubmitting={updateWalletMutation.isPending}
        mode="edit"
        onSubmit={onSaveWallet}
        onWalletIconKeyChange={setWalletIconKey}
        onWalletNameChange={setWalletName}
        walletIconKey={walletIconKey}
        walletName={walletName}
      />
    </section>
  );
}
