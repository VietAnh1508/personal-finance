import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CURRENCY_OPTIONS, type CurrencyCode } from '../../domain/currency';
import { selectCurrency } from '../../domain/services';
import { onboardingStatusQueryKey, useOnboardingStatus } from './use-onboarding-status';

export function CurrencyOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoading, selectedCurrency, hasWallet } = useOnboardingStatus();
  const [selectedCode, setSelectedCode] = useState<CurrencyCode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-6 text-slate-100">
        <p className="text-sm text-slate-300">Loading onboarding...</p>
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
      navigate('/onboarding/wallet', { replace: true });
    } catch {
      setErrorMessage('Unable to save your currency. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200/20 bg-slate-900/50 p-8 shadow-2xl backdrop-blur md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Step 1 of 2</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Choose your currency</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
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
                    : 'border-slate-300/20 bg-slate-800/30 hover:border-amber-300/40 hover:bg-slate-800/60'
                }`}
                onClick={() => setSelectedCode(currency.code)}
                type="button">
                <p className="text-lg font-semibold">{currency.label}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {currency.code} ({currency.symbol}) • {currency.fractionDigits} decimals
                </p>
              </button>
            );
          })}
        </div>

        {errorMessage ? <p className="mt-5 text-sm text-rose-300">{errorMessage}</p> : null}

        <div className="mt-8 flex justify-end">
          <button
            className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
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
