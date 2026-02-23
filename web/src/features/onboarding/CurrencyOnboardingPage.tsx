import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CURRENCY_OPTIONS, type CurrencyCode } from '@/domain/currency';
import { selectCurrency } from '@/domain/services';
import { useToast } from '@/features/feedback/ToastProvider';
import { onboardingStatusQueryKey, useOnboardingStatus } from '@/features/onboarding/use-onboarding-status';

export function CurrencyOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { isLoading, selectedCurrency, hasWallet } = useOnboardingStatus();
  const [selectedCode, setSelectedCode] = useState<CurrencyCode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <main className="pf-page-shell-center">
        <p className="pf-muted-text text-sm">Loading onboarding...</p>
      </main>
    );
  }

  if (hasWallet) {
    return <Navigate replace to="/transactions" />;
  }

  if (selectedCurrency) {
    return <Navigate replace to="/onboarding/wallet" />;
  }

  const handleContinue = async () => {
    if (!selectedCode || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      await selectCurrency(selectedCode);
      queryClient.setQueryData(onboardingStatusQueryKey, {
        selectedCurrency: selectedCode,
        hasWallet: false,
      });
      showToast({
        type: 'success',
        message: 'Currency saved.',
      });
      navigate('/onboarding/wallet', { replace: true });
    } catch {
      showToast({
        type: 'error',
        message: 'Unable to save your currency. Please try again.',
      });
      setErrorMessage('Unable to save your currency. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="pf-page-shell">
      <section className="pf-card mx-auto max-w-4xl p-8 shadow-2xl md:p-10">
        <p className="pf-kicker">Step 1 of 2</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Choose your currency</h1>
        <p className="pf-muted-text mt-4 max-w-2xl text-sm leading-6 md:text-base">
          This sets how money is displayed across wallets and transactions. You can update it later in settings.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {CURRENCY_OPTIONS.map((currency) => {
            const isSelected = selectedCode === currency.code;
            return (
              <button
                key={currency.code}
                aria-pressed={isSelected}
                className={`group rounded-2xl border p-5 text-left transition ${
                  isSelected
                    ? 'border-emerald-300 bg-emerald-300/10 ring-2 ring-emerald-300/40'
                    : 'border-[var(--pf-border-soft)] bg-[var(--pf-surface-soft)] hover:border-[var(--pf-border-strong)] hover:bg-[var(--pf-surface-hover)]'
                }`}
                onClick={() => setSelectedCode(currency.code)}
                type="button">
                <p className="text-lg font-semibold">{currency.label}</p>
                <p className="pf-muted-text mt-1 text-sm">
                  {currency.code} ({currency.symbol}) • {currency.fractionDigits} decimals
                </p>
              </button>
            );
          })}
        </div>

        {errorMessage ? <p className="mt-5 text-sm text-[var(--pf-danger)]">{errorMessage}</p> : null}

        <div className="mt-8 flex justify-end">
          <button
            className="pf-button-primary px-6 py-3"
            disabled={!selectedCode || isSaving}
            onClick={() => {
              void handleContinue();
            }}
            type="button">
            {isSaving ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </section>
    </main>
  );
}
