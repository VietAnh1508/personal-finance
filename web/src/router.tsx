import { createBrowserRouter, createMemoryRouter, Link, Outlet, type RouteObject } from 'react-router-dom';
import { CurrencyOnboardingPage } from './features/onboarding/CurrencyOnboardingPage';
import { FirstWalletOnboardingPage } from './features/onboarding/FirstWalletOnboardingPage';
import { OnboardingGatePage } from './features/onboarding/OnboardingGatePage';

type PlaceholderPageProps = {
  heading: string;
  description: string;
};

function PlaceholderPage({ heading, description }: PlaceholderPageProps) {
  return (
    <section className="rounded-3xl border border-slate-200/20 bg-slate-900/50 p-7 shadow-xl backdrop-blur">
      <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
      <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
    </section>
  );
}

function RouteDirectoryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200/20 bg-slate-900/50 p-8 shadow-2xl backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Web Migration</p>
        <h1 className="mt-3 text-3xl font-semibold">Routing Directory</h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">Development shortcut links for route verification.</p>

        <nav aria-label="Route directory" className="mt-8 grid gap-2 sm:grid-cols-2">
          <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/">
            App Root Gate
          </Link>
          <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/onboarding/currency">
            Onboarding Currency
          </Link>
          <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/onboarding/wallet">
            First Wallet Setup
          </Link>
          <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/transactions">
            Transactions
          </Link>
          <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/transactions/add">
            Add Transaction
          </Link>
          <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/transactions/transfer">
            Transfer
          </Link>
          <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/transactions/adjustment">
            Adjustment
          </Link>
          <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/transactions/demo-id">
            Transaction Detail
          </Link>
          <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/settings">
            Settings
          </Link>
          <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/settings/wallets">
            Wallet Settings
          </Link>
        </nav>
      </section>
    </main>
  );
}

function AppLayout() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">App Area</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/routes">
              Routes
            </Link>
            <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/transactions">
              Transactions
            </Link>
            <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/transactions/add">
              Add
            </Link>
            <Link className="rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/settings">
              Settings
            </Link>
          </div>
        </header>
        <Outlet />
      </div>
    </main>
  );
}

function TransactionDetailPlaceholderPage() {
  return (
    <PlaceholderPage
      heading="Transaction Detail Route"
      description="Placeholder screen for viewing a single transaction by ID."
    />
  );
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-6 text-slate-100">
      <section className="max-w-lg rounded-3xl border border-slate-300/20 bg-slate-900/60 p-8 text-center shadow-xl">
        <h1 className="text-2xl font-semibold">404 - Route Not Found</h1>
        <p className="mt-3 text-slate-300">The requested page does not exist in the migration route shell.</p>
        <Link className="mt-6 inline-block rounded-md border border-slate-300/20 px-3 py-2 hover:bg-slate-700/40" to="/routes">
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
        element: (
          <PlaceholderPage
            heading="Transactions Route"
            description="Placeholder screen for the transactions list and wallet context top bar."
          />
        ),
      },
      {
        path: '/transactions/add',
        element: (
          <PlaceholderPage
            heading="Add Transaction Route"
            description="Placeholder screen for adding income and expense transactions."
          />
        ),
      },
      {
        path: '/transactions/transfer',
        element: (
          <PlaceholderPage
            heading="Transfer Route"
            description="Placeholder screen for creating transfers between wallets."
          />
        ),
      },
      {
        path: '/transactions/adjustment',
        element: (
          <PlaceholderPage
            heading="Adjustment Route"
            description="Placeholder screen for balance adjustment transactions."
          />
        ),
      },
      {
        path: '/transactions/:id',
        element: <TransactionDetailPlaceholderPage />,
      },
      {
        path: '/settings',
        element: (
          <PlaceholderPage
            heading="Settings Route"
            description="Placeholder screen for settings overview actions."
          />
        ),
      },
      {
        path: '/settings/wallets',
        element: (
          <PlaceholderPage
            heading="Wallet Settings Route"
            description="Placeholder screen for wallet management settings."
          />
        ),
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
