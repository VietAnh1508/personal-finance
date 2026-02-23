import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { WalletIcon } from '@/components/WalletIcon';
import { WALLET_ICON_OPTIONS, type WalletIconKey } from '@/domain/wallet-icon';
import { createWallet, setLastUsedWalletContext } from '@/domain/services';
import { formatAmountInput, isValidAmountInput, parseAmountToMinorUnits } from '@/utils/money-format';
import { useToast } from '@/features/feedback/ToastProvider';
import { onboardingStatusQueryKey, useOnboardingStatus } from '@/features/onboarding/use-onboarding-status';

export function FirstWalletOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { isLoading, selectedCurrency, hasWallet } = useOnboardingStatus();

  const [walletName, setWalletName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<WalletIconKey>('wallet');
  const [initialBalance, setInitialBalance] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const parsedBalance = useMemo(() => parseAmountToMinorUnits(initialBalance), [initialBalance]);
  const isFormValid = walletName.trim().length > 0 && parsedBalance !== null;

  if (isLoading) {
    return (
      <main className="pf-page-shell-center">
        <p className="pf-muted-text text-sm">Loading onboarding...</p>
      </main>
    );
  }

  if (!selectedCurrency) {
    return <Navigate replace to="/onboarding/currency" />;
  }

  if (hasWallet) {
    return <Navigate replace to="/transactions" />;
  }

  const handleInitialBalanceChange = (nextValue: string) => {
    const normalized = nextValue.replace(/,/g, '');
    if (!isValidAmountInput(normalized)) {
      return;
    }

    setInitialBalance(formatAmountInput(normalized));
  };

  const handleCreateWallet = async () => {
    if (!isFormValid || parsedBalance === null || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      const wallet = await createWallet(walletName, parsedBalance, selectedIcon);
      await setLastUsedWalletContext(wallet.id);
      queryClient.setQueryData(onboardingStatusQueryKey, {
        selectedCurrency,
        hasWallet: true,
      });
      showToast({
        type: 'success',
        message: 'Wallet created successfully.',
      });
      navigate('/transactions', { replace: true });
    } catch {
      showToast({
        type: 'error',
        message: 'Unable to create wallet. Please review your values and try again.',
      });
      setErrorMessage('Unable to create wallet. Please review your values and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="pf-page-shell">
      <section className="pf-card mx-auto max-w-4xl p-8 shadow-2xl md:p-10">
        <p className="pf-kicker">Step 2 of 2</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Create your first wallet</h1>
        <p className="pf-muted-text mt-4 max-w-2xl text-sm leading-6 md:text-base">
          Add a wallet name, choose an icon, and set an opening balance. Currency display is set to{' '}
          <span className="font-semibold text-[var(--pf-accent)]">{selectedCurrency}</span>.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr,1fr]">
          <section className="pf-soft-card space-y-4 p-5">
            <label className="pf-label block font-medium" htmlFor="wallet-name">
              Wallet name
            </label>
            <input
              className="pf-input w-full px-4 py-3 text-base"
              id="wallet-name"
              maxLength={60}
              onChange={(event) => setWalletName(event.target.value)}
              placeholder="e.g. Daily Cash"
              value={walletName}
            />

            <label className="pf-label block font-medium" htmlFor="wallet-initial-balance">
              Initial balance
            </label>
            <input
              className="pf-input w-full px-4 py-3 text-base"
              id="wallet-initial-balance"
              inputMode="decimal"
              onChange={(event) => handleInitialBalanceChange(event.target.value)}
              placeholder="0.00"
              value={initialBalance}
            />
            <p className="pf-muted-text text-xs">Enter a valid amount (up to 2 decimal places).</p>
          </section>

          <section className="pf-soft-card p-5">
            <p className="pf-label font-medium">Wallet icon</p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {WALLET_ICON_OPTIONS.map((iconOption) => {
                const isSelected = selectedIcon === iconOption.key;
                return (
                  <button
                    key={iconOption.key}
                    aria-label={`Select ${iconOption.label} icon`}
                    className={`rounded-xl border p-3 transition ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-300/10 ring-2 ring-emerald-300/40'
                        : 'border-[var(--pf-border-soft)] bg-[var(--pf-surface-strong)] hover:border-[var(--pf-border-strong)]'
                    }`}
                    onClick={() => setSelectedIcon(iconOption.key)}
                    type="button">
                    <WalletIcon className="mx-auto h-6 w-6" iconKey={iconOption.key} />
                    <p className="mt-2 text-xs">{iconOption.label}</p>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {parsedBalance === null ? <p className="mt-5 text-sm text-[var(--pf-danger)]">Enter a valid amount.</p> : null}
        {errorMessage ? <p className="mt-2 text-sm text-[var(--pf-danger)]">{errorMessage}</p> : null}

        <div className="mt-8 flex justify-end">
          <button
            className="pf-button-primary px-6 py-3"
            disabled={!isFormValid || isSaving}
            onClick={() => {
              void handleCreateWallet();
            }}
            type="button">
            {isSaving ? 'Saving...' : 'Create wallet'}
          </button>
        </div>
      </section>
    </main>
  );
}
