import { Navigate } from 'react-router-dom';
import { useOnboardingStatus } from '@/features/onboarding/use-onboarding-status';

export function OnboardingGatePage() {
  const { isLoading, selectedCurrency, hasWallet } = useOnboardingStatus();

  if (isLoading) {
    return (
      <main className="pf-page-shell-center">
        <div className="flex items-center gap-3 rounded-full border border-[var(--pf-border-soft)] bg-[var(--pf-surface-soft)] px-5 py-3 text-sm">
          <span aria-hidden className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-300" />
          Loading your local app state...
        </div>
      </main>
    );
  }

  if (!selectedCurrency) {
    return <Navigate replace to="/onboarding/currency" />;
  }

  if (!hasWallet) {
    return <Navigate replace to="/onboarding/wallet" />;
  }

  return <Navigate replace to="/transactions" />;
}
