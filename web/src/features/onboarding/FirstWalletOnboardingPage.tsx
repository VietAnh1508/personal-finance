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
      <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-6 text-slate-100">
        <p className="text-sm text-slate-300">Loading onboarding...</p>
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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200/20 bg-slate-900/50 p-8 shadow-2xl backdrop-blur md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Step 2 of 2</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Create your first wallet</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
          Add a wallet name, choose an icon, and set an opening balance. Currency display is set to{' '}
          <span className="font-semibold text-amber-200">{selectedCurrency}</span>.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr,1fr]">
          <section className="space-y-4 rounded-2xl border border-slate-300/20 bg-slate-800/25 p-5">
            <label className="block text-sm font-medium text-slate-200" htmlFor="wallet-name">
              Wallet name
            </label>
            <input
              className="w-full rounded-xl border border-slate-300/30 bg-slate-900/60 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/40"
              id="wallet-name"
              maxLength={60}
              onChange={(event) => setWalletName(event.target.value)}
              placeholder="e.g. Daily Cash"
              value={walletName}
            />

            <label className="block text-sm font-medium text-slate-200" htmlFor="wallet-initial-balance">
              Initial balance
            </label>
            <input
              className="w-full rounded-xl border border-slate-300/30 bg-slate-900/60 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/40"
              id="wallet-initial-balance"
              inputMode="decimal"
              onChange={(event) => handleInitialBalanceChange(event.target.value)}
              placeholder="0.00"
              value={initialBalance}
            />
            <p className="text-xs text-slate-400">Enter a valid amount (up to 2 decimal places).</p>
          </section>

          <section className="rounded-2xl border border-slate-300/20 bg-slate-800/25 p-5">
            <p className="text-sm font-medium text-slate-200">Wallet icon</p>
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
                        : 'border-slate-300/25 bg-slate-900/55 hover:border-amber-300/45'
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

        {parsedBalance === null ? <p className="mt-5 text-sm text-rose-300">Enter a valid amount.</p> : null}
        {errorMessage ? <p className="mt-2 text-sm text-rose-300">{errorMessage}</p> : null}

        <div className="mt-8 flex justify-end">
          <button
            className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
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
