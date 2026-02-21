import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { closeDatabaseConnection, openDatabaseConnection } from '../../data/database';
import {
  archiveActiveWallet,
  listActiveWallets,
  listArchivedWallets,
  resetLocalAppData,
  saveCurrencyPreference,
  saveWallet,
} from '../../data/repositories';
import { ToastProvider } from '../feedback/ToastProvider';
import { WalletSettingsPage } from './WalletSettingsPage';

function renderWalletSettingsPage() {
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
    ],
    { initialEntries: ['/settings/wallets'] }
  );

  render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
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

  it('creates, edits, and archives wallets from settings', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });

    renderWalletSettingsPage();

    expect(await screen.findByRole('heading', { name: 'Wallet management' })).toBeInTheDocument();

    fireEvent.change(await screen.findByLabelText('Wallet name'), { target: { value: 'Savings' } });
    fireEvent.change(screen.getByLabelText('Initial balance ($)'), { target: { value: '250.50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create wallet' }));

    await waitFor(async () => {
      const wallets = await listActiveWallets();
      expect(wallets.some((wallet) => wallet.name === 'Savings' && wallet.initialBalance === 250_50)).toBe(true);
    });

    const editCashButton = await screen.findByRole('button', { name: 'Edit Cash' });
    fireEvent.click(editCashButton);

    fireEvent.change(screen.getByLabelText('Edit wallet name'), { target: { value: 'Cash Wallet' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(async () => {
      const wallets = await listActiveWallets();
      expect(wallets.some((wallet) => wallet.name === 'Cash Wallet')).toBe(true);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Archive Cash Wallet' }));

    await waitFor(async () => {
      const activeWallets = await listActiveWallets();
      const archivedWallets = await listArchivedWallets();
      expect(activeWallets.some((wallet) => wallet.name === 'Cash Wallet')).toBe(false);
      expect(archivedWallets.some((wallet) => wallet.name === 'Cash Wallet')).toBe(true);
    });
  });

  it('hides archived wallets by default and shows them when toggled', async () => {
    await saveCurrencyPreference('USD');
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
