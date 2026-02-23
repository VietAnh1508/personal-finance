import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { closeDatabaseConnection, openDatabaseConnection } from '@/data/database';
import { listActiveWallets, resetLocalAppData, saveCurrencyPreference } from '@/data/repositories';
import { ToastProvider } from '@/features/feedback/ToastProvider';
import { WalletCreatePage } from '@/features/settings/WalletCreatePage';
import { WalletSettingsPage } from '@/features/settings/WalletSettingsPage';

function renderWalletCreatePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const router = createMemoryRouter(
    [
      {
        path: '/settings/wallets/add',
        element: <WalletCreatePage />,
      },
      {
        path: '/settings/wallets',
        element: <WalletSettingsPage />,
      },
    ],
    { initialEntries: ['/settings/wallets/add'] }
  );

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('WalletCreatePage', () => {
  beforeEach(async () => {
    await openDatabaseConnection();
    await resetLocalAppData();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('creates a wallet and navigates back to wallet management', async () => {
    await saveCurrencyPreference('USD');

    renderWalletCreatePage();

    expect(await screen.findByRole('heading', { name: 'Add wallet' })).toBeInTheDocument();

    fireEvent.change(await screen.findByLabelText('Wallet name'), { target: { value: 'Savings' } });
    fireEvent.change(screen.getByLabelText('Initial balance ($)'), { target: { value: '250.50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create wallet' }));

    expect(await screen.findByRole('heading', { name: 'Wallet management' })).toBeInTheDocument();

    await waitFor(async () => {
      const wallets = await listActiveWallets();
      expect(wallets.some((wallet) => wallet.name === 'Savings' && wallet.initialBalance === 250_50)).toBe(true);
    });
  });
});
