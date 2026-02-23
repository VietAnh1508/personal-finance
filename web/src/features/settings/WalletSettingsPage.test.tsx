import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { closeDatabaseConnection, openDatabaseConnection } from '@/data/database';
import {
  archiveActiveWallet,
  listActiveWallets,
  listArchivedWallets,
  resetLocalAppData,
  saveWallet,
} from '@/data/repositories';
import { ToastProvider } from '@/features/feedback/ToastProvider';
import { WalletSettingsPage } from '@/features/settings/WalletSettingsPage';

function renderWalletSettingsPage() {
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
        path: '/settings/wallets',
        element: <WalletSettingsPage />,
      },
      {
        path: '/settings',
        element: <h1>Settings Route</h1>,
      },
      {
        path: '/settings/wallets/add',
        element: <h1>Add Wallet Route</h1>,
      },
      {
        path: '/settings/wallets/:walletId/edit',
        element: <h1>Edit Wallet Route</h1>,
      },
    ],
    { initialEntries: ['/settings/wallets'] }
  );

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('WalletSettingsPage', () => {
  beforeEach(async () => {
    await openDatabaseConnection();
    await resetLocalAppData();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('shows active wallets by default and links to add/edit pages', async () => {
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });

    renderWalletSettingsPage();

    expect(await screen.findByRole('heading', { name: 'Wallet management' })).toBeInTheDocument();
    expect(await screen.findByText('Cash')).toBeInTheDocument();

    const addWalletLink = screen.getByRole('link', { name: 'Add' });
    expect(addWalletLink).toHaveAttribute('href', '/settings/wallets/add');

    const editWalletLink = screen.getByRole('link', { name: 'Edit Cash' });
    expect(editWalletLink).toHaveAttribute('href', '/settings/wallets/wallet_cash/edit');

    fireEvent.click(editWalletLink);

    expect(await screen.findByRole('heading', { name: 'Edit Wallet Route' })).toBeInTheDocument();
  });

  it('archives wallets from settings', async () => {
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });

    renderWalletSettingsPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Archive Cash' }));

    await waitFor(async () => {
      const activeWallets = await listActiveWallets();
      const archivedWallets = await listArchivedWallets();
      expect(activeWallets.some((wallet) => wallet.name === 'Cash')).toBe(false);
      expect(archivedWallets.some((wallet) => wallet.name === 'Cash')).toBe(true);
    });
  });

  it('hides archived wallets by default and shows them when toggled', async () => {
    await saveWallet({
      id: 'wallet_active',
      name: 'Active Wallet',
      initialBalance: 10_00,
      iconKey: 'bank',
    });
    await saveWallet({
      id: 'wallet_archived',
      name: 'Archived Wallet',
      initialBalance: 20_00,
      iconKey: 'cash',
    });
    await archiveActiveWallet('wallet_archived');

    renderWalletSettingsPage();

    expect(await screen.findByText('Active Wallet')).toBeInTheDocument();
    expect(screen.queryByText('Archived Wallet')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Show archived wallets'));

    expect(await screen.findByText('Archived Wallet')).toBeInTheDocument();
  });
});
