import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { closeDatabaseConnection, openDatabaseConnection } from '@/data/database';
import { listActiveWallets, resetLocalAppData, saveWallet } from '@/data/repositories';
import { ToastProvider } from '@/features/feedback/ToastProvider';
import { WalletEditPage } from '@/features/settings/WalletEditPage';
import { WalletSettingsPage } from '@/features/settings/WalletSettingsPage';

function renderWalletEditPage(initialPath = '/settings/wallets/wallet_cash/edit') {
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
        path: '/settings/wallets/:walletId/edit',
        element: <WalletEditPage />,
      },
      {
        path: '/settings/wallets',
        element: <WalletSettingsPage />,
      },
    ],
    { initialEntries: [initialPath] }
  );

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('WalletEditPage', () => {
  beforeEach(async () => {
    await openDatabaseConnection();
    await resetLocalAppData();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('loads existing wallet details, saves updates, and returns to wallet management', async () => {
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });

    renderWalletEditPage();

    expect(await screen.findByRole('heading', { name: 'Edit wallet' })).toBeInTheDocument();

    const walletNameInput = (await screen.findByLabelText('Wallet name')) as HTMLInputElement;
    expect(walletNameInput.value).toBe('Cash');

    fireEvent.change(walletNameInput, { target: { value: 'Cash Wallet' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('heading', { name: 'Wallet management' })).toBeInTheDocument();

    await waitFor(async () => {
      const wallets = await listActiveWallets();
      expect(wallets.some((wallet) => wallet.name === 'Cash Wallet')).toBe(true);
    });
  });

  it('shows not found state for missing wallet id', async () => {
    renderWalletEditPage('/settings/wallets/unknown-wallet/edit');

    expect(await screen.findByText('Wallet not found.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to wallet management' })).toHaveAttribute('href', '/settings/wallets');
  });
});
