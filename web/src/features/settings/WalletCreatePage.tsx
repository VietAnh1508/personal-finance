import { useMutation } from '@tanstack/react-query';
import { type SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { PageLoadingState } from '@/components/PageLoadingState';
import { getCurrencySymbol } from '@/domain/currency';
import { type WalletIconKey } from '@/domain/wallet-icon';
import { createWallet } from '@/domain/services';
import { formatAmountInput, isValidAmountInput, parseAmountToMinorUnits } from '@/utils/money-format';
import { useToast } from '@/features/feedback/ToastProvider';
import { useSelectedCurrencyQuery } from '@/features/shared/useSelectedCurrencyQuery';
import { WalletForm } from '@/features/settings/WalletForm';

export function WalletCreatePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [walletName, setWalletName] = useState('');
  const [initialBalanceInput, setInitialBalanceInput] = useState('');
  const [walletIconKey, setWalletIconKey] = useState<WalletIconKey>('wallet');
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  const selectedCurrencyQuery = useSelectedCurrencyQuery();

  const createWalletMutation = useMutation({
    mutationFn: async (params: { name: string; initialBalance: number; iconKey: WalletIconKey }) =>
      createWallet(params.name, params.initialBalance, params.iconKey),
    onSuccess: () => {
      showToast({
        type: 'success',
        message: 'Wallet created successfully.',
      });
      navigate('/settings/wallets');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unable to create wallet.';
      setFormErrorMessage(message);
      showToast({
        type: 'error',
        message,
      });
    },
  });

  const currencySymbol = getCurrencySymbol(selectedCurrencyQuery.data ?? 'USD');
  const errorMessage =
    formErrorMessage ??
    (selectedCurrencyQuery.error instanceof Error ? selectedCurrencyQuery.error.message : null);

  const onInitialBalanceChange = (nextValue: string) => {
    const normalized = nextValue.replace(/,/g, '');
    if (!isValidAmountInput(normalized)) {
      return;
    }

    setInitialBalanceInput(formatAmountInput(normalized));
  };

  const onCreateWallet = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    setFormErrorMessage(null);

    const parsedBalance = parseAmountToMinorUnits(initialBalanceInput);
    if (parsedBalance === null) {
      setFormErrorMessage('Initial balance must be a valid amount.');
      return;
    }

    await createWalletMutation.mutateAsync({
      name: walletName,
      initialBalance: parsedBalance,
      iconKey: walletIconKey,
    });
  };

  if (selectedCurrencyQuery.isLoading) {
    return <PageLoadingState message="Loading form..." title="Add wallet" />;
  }

  return (
    <section className="space-y-4 pf-card p-7">
      <PageHeader backLabel="Back to wallet management" backTo="/settings/wallets" title="Add wallet" />

      <WalletForm
        currencySymbol={currencySymbol}
        errorMessage={errorMessage}
        initialBalanceInput={initialBalanceInput}
        isSubmitting={createWalletMutation.isPending}
        mode="create"
        onInitialBalanceInputChange={onInitialBalanceChange}
        onSubmit={onCreateWallet}
        onWalletIconKeyChange={setWalletIconKey}
        onWalletNameChange={setWalletName}
        walletIconKey={walletIconKey}
        walletName={walletName}
      />
    </section>
  );
}
