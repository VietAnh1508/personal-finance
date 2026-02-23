import { createBrowserRouter, createMemoryRouter, Link, Outlet, type RouteObject, useLocation } from 'react-router-dom';
import { MobileFooterTabNav } from '@/components/MobileFooterTabNav';
import { CurrencyOnboardingPage } from '@/features/onboarding/CurrencyOnboardingPage';
import { FirstWalletOnboardingPage } from '@/features/onboarding/FirstWalletOnboardingPage';
import { OnboardingGatePage } from '@/features/onboarding/OnboardingGatePage';
import { WalletCreatePage } from '@/features/settings/WalletCreatePage';
import { WalletEditPage } from '@/features/settings/WalletEditPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { WalletSettingsPage } from '@/features/settings/WalletSettingsPage';
import { AddAdjustmentPage } from '@/features/transactions/AddAdjustmentPage';
import { AddIncomeExpensePage } from '@/features/transactions/AddIncomeExpensePage';
import { TransactionDetailPage } from '@/features/transactions/TransactionDetailPage';
import { AddTransferPage } from '@/features/transactions/AddTransferPage';
import { TransactionsPage } from '@/features/transactions/TransactionsPage';

function RouteDirectoryPage() {
  return (
    <main className="pf-page-shell">
      <section className="pf-card mx-auto max-w-3xl p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--pf-accent)]">Web Migration</p>
        <h1 className="mt-3 text-3xl font-semibold">Routing Directory</h1>
        <p className="pf-muted-text mt-4 text-sm leading-7">Development shortcut links for route verification.</p>

        <nav aria-label="Route directory" className="mt-8 grid gap-2 sm:grid-cols-2">
          <Link className="pf-button-ghost" to="/">
            App Root Gate
          </Link>
          <Link className="pf-button-ghost" to="/onboarding/currency">
            Onboarding Currency
          </Link>
          <Link className="pf-button-ghost" to="/onboarding/wallet">
            First Wallet Setup
          </Link>
          <Link className="pf-button-ghost" to="/transactions">
            Transactions
          </Link>
          <Link className="pf-button-ghost" to="/transactions/add">
            Add Transaction
          </Link>
          <Link className="pf-button-ghost" to="/transactions/transfer">
            Transfer
          </Link>
          <Link className="pf-button-ghost" to="/transactions/adjustment">
            Adjustment
          </Link>
          <Link className="pf-button-ghost" to="/transactions/demo-id">
            Transaction Detail
          </Link>
          <Link className="pf-button-ghost" to="/settings">
            Settings
          </Link>
          <Link className="pf-button-ghost" to="/settings/wallets">
            Wallet Settings
          </Link>
          <Link className="pf-button-ghost" to="/settings/wallets/add">
            Add Wallet
          </Link>
          <Link className="pf-button-ghost" to="/settings/wallets/demo-wallet/edit">
            Edit Wallet
          </Link>
        </nav>
      </section>
    </main>
  );
}

function AppLayout() {
  const { pathname } = useLocation();
  const showFooterNavigation = pathname === '/transactions' || pathname === '/settings';

  return (
    <main className="pf-page-shell">
      <div className={`mx-auto max-w-4xl space-y-6 ${showFooterNavigation ? 'pb-24' : ''}`}>
        <Outlet />
      </div>
      {showFooterNavigation ? <MobileFooterTabNav /> : null}
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="pf-page-shell-center">
      <section className="pf-card max-w-lg p-8 text-center">
        <h1 className="text-2xl font-semibold">404 - Route Not Found</h1>
        <p className="pf-muted-text mt-3">The requested page does not exist in the migration route shell.</p>
        <Link className="pf-button-ghost mt-6 inline-block" to="/routes">
          Open Route Directory
        </Link>
      </section>
    </main>
  );
}

export const routeConfig: RouteObject[] = [
  {
    path: '/',
    element: <OnboardingGatePage />,
  },
  {
    path: '/routes',
    element: <RouteDirectoryPage />,
  },
  {
    path: '/onboarding/currency',
    element: <CurrencyOnboardingPage />,
  },
  {
    path: '/onboarding/wallet',
    element: <FirstWalletOnboardingPage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/transactions',
        element: <TransactionsPage />,
      },
      {
        path: '/transactions/add',
        element: <AddIncomeExpensePage />,
      },
      {
        path: '/transactions/transfer',
        element: <AddTransferPage />,
      },
      {
        path: '/transactions/adjustment',
        element: <AddAdjustmentPage />,
      },
      {
        path: '/transactions/:id',
        element: <TransactionDetailPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '/settings/wallets',
        element: <WalletSettingsPage />,
      },
      {
        path: '/settings/wallets/add',
        element: <WalletCreatePage />,
      },
      {
        path: '/settings/wallets/:walletId/edit',
        element: <WalletEditPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export const appRouter = createBrowserRouter(routeConfig);

export function createTestRouter(initialEntries: string[]) {
  return createMemoryRouter(routeConfig, { initialEntries });
}
