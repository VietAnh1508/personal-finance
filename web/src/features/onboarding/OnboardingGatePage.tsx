import { Navigate } from 'react-router-dom';
import { useOnboardingStatus } from './use-onboarding-status';

export function OnboardingGatePage() {
  const { isLoading, selectedCurrency, hasWallet } = useOnboardingStatus();

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-6 text-slate-100">
        <div className="flex items-center gap-3 rounded-full border border-slate-300/20 bg-slate-800/30 px-5 py-3 text-sm">
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
