import { createBrowserRouter, createMemoryRouter, Link, Outlet, type RouteObject } from 'react-router-dom';

function RouteDirectoryPage() {
  return (
    <main className="min-h-screen bg-brand-bg px-6 py-12 text-brand-ink">
      <section className="mx-auto max-w-3xl rounded-2xl border border-amber-800/20 bg-white/70 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Web Migration</p>
        <h1 className="mt-3 text-3xl font-bold">Routing Shell</h1>
        <p className="mt-4 text-base leading-7">Use these placeholder routes while migration stories are implemented.</p>

        <nav aria-label="Route directory" className="mt-8 grid gap-2 sm:grid-cols-2">
          <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/onboarding/currency">
            Onboarding Currency
          </Link>
          <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/onboarding/wallet">
            First Wallet Setup
          </Link>
          <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/transactions">
            Transactions
          </Link>
          <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/transactions/add">
            Add Transaction
          </Link>
          <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/transactions/transfer">
            Transfer
          </Link>
          <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/transactions/adjustment">
            Adjustment
          </Link>
          <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/transactions/demo-id">
            Transaction Detail
          </Link>
          <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/settings">
            Settings
          </Link>
          <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/settings/wallets">
            Wallet Settings
          </Link>
        </nav>
      </section>
    </main>
  );
}

type PlaceholderPageProps = {
  heading: string;
  description: string;
};

function PlaceholderPage({ heading, description }: PlaceholderPageProps) {
  return (
    <section className="rounded-2xl border border-amber-800/20 bg-white/70 p-8 shadow-sm">
      <h1 className="text-2xl font-bold">{heading}</h1>
      <p className="mt-3 leading-7">{description}</p>
    </section>
  );
}

function GuestLayout() {
  return (
    <main className="min-h-screen bg-brand-bg px-6 py-12 text-brand-ink">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Guest Flow</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/">
              Route Directory
            </Link>
            <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/onboarding/currency">
              Currency
            </Link>
            <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/onboarding/wallet">
              Wallet
            </Link>
          </div>
        </header>
        <Outlet />
      </div>
    </main>
  );
}

function AppLayout() {
  return (
    <main className="min-h-screen bg-brand-bg px-6 py-12 text-brand-ink">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Authenticated Flow</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/">
              Route Directory
            </Link>
            <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/transactions">
              Transactions
            </Link>
            <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/transactions/add">
              Add
            </Link>
            <Link className="rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/settings">
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
    <main className="grid min-h-screen place-items-center bg-brand-bg px-6 text-brand-ink">
      <section className="max-w-lg rounded-2xl border border-amber-800/20 bg-white/70 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">404 - Route Not Found</h1>
        <p className="mt-3">The requested page does not exist in the migration route shell.</p>
        <Link className="mt-6 inline-block rounded-md border border-amber-800/20 px-3 py-2 hover:bg-amber-100/40" to="/">
          Back to Route Directory
        </Link>
      </section>
    </main>
  );
}

export const routeConfig: RouteObject[] = [
  {
    path: '/',
    element: <RouteDirectoryPage />,
  },
  {
    element: <GuestLayout />,
    children: [
      {
        path: '/onboarding/currency',
        element: (
          <PlaceholderPage
            heading="Onboarding Currency Route"
            description="Placeholder screen for selecting preferred currency on first launch."
          />
        ),
      },
      {
        path: '/onboarding/wallet',
        element: (
          <PlaceholderPage
            heading="Wallet Setup Route"
            description="Placeholder screen for creating the first wallet during onboarding."
          />
        ),
      },
    ],
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
