import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import {
  closeDatabaseConnection,
  openDatabaseConnection,
} from '@/data/database';
import {
  archiveActiveWallet,
  getLastSelectedWalletContext,
  resetLocalAppData,
  saveCurrencyPreference,
  saveLastSelectedWalletContext,
  saveTransaction,
  saveWallet,
} from '@/data/repositories';
import { TransactionsPage } from '@/features/transactions/TransactionsPage';

function renderTransactionsPage() {
  const router = createMemoryRouter(
    [
      { path: '/transactions', element: <TransactionsPage /> },
      { path: '/transactions/:id', element: <h1>Transaction Detail Route</h1> },
      { path: '/transactions/transfer', element: <h1>Transfer Route</h1> },
      { path: '/transactions/adjustment', element: <h1>Adjustment Route</h1> },
    ],
    { initialEntries: ['/transactions'] }
  );

  render(<RouterProvider router={router} />);
}

describe('TransactionsPage', () => {
  beforeEach(async () => {
    await openDatabaseConnection();
    await resetLocalAppData();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('renders grouped transactions and total for all active wallets only', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_b',
      name: 'Bank',
      initialBalance: 50_00,
      iconKey: 'bank',
    });
    await saveWallet({
      id: 'wallet_archived',
      name: 'Old Wallet',
      initialBalance: 25_00,
      iconKey: 'cash',
    });

    await saveTransaction({
      id: 'txn_1',
      type: 'income',
      walletId: 'wallet_a',
      amount: 10_00,
      category: 'Salary',
      date: '2026-02-20',
      note: null,
      transferId: null,
    });
    await saveTransaction({
      id: 'txn_2',
      type: 'expense',
      walletId: 'wallet_b',
      amount: 3_00,
      category: 'Food',
      date: '2026-02-20',
      note: 'Lunch',
      transferId: null,
    });
    await saveTransaction({
      id: 'txn_3',
      type: 'income',
      walletId: 'wallet_archived',
      amount: 9_00,
      category: 'Legacy income',
      date: '2026-02-19',
      note: null,
      transferId: null,
    });
    await archiveActiveWallet('wallet_archived');

    renderTransactionsPage();

    expect(await screen.findByRole('heading', { name: 'Transactions' })).toBeInTheDocument();
    const selector = await screen.findByLabelText('Select wallet context');
    expect((selector as HTMLSelectElement).value).toBe('all');
    expect(screen.getByText('$157.00')).toBeInTheDocument();
    expect(screen.getByText('+$7.00')).toBeInTheDocument();
    expect(screen.queryByText('Legacy income')).not.toBeInTheDocument();
  });

  it('restores wallet context and persists updates', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_b',
      name: 'Bank',
      initialBalance: 50_00,
      iconKey: 'bank',
    });
    await saveLastSelectedWalletContext('wallet_b');
    await saveTransaction({
      id: 'txn_1',
      type: 'expense',
      walletId: 'wallet_b',
      amount: 3_00,
      category: 'Food',
      date: '2026-02-20',
      note: null,
      transferId: null,
    });

    renderTransactionsPage();

    const selector = await screen.findByLabelText('Select wallet context');
    await waitFor(() => {
      expect((selector as HTMLSelectElement).value).toBe('wallet_b');
    });
    expect(screen.getByText('$47.00')).toBeInTheDocument();

    fireEvent.change(selector, { target: { value: 'all' } });

    await waitFor(() => {
      expect((selector as HTMLSelectElement).value).toBe('all');
    });
    await expect(getLastSelectedWalletContext()).resolves.toBe('all');
  });

  it('falls back to all wallets when persisted context is archived', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_archived',
      name: 'Old Wallet',
      initialBalance: 50_00,
      iconKey: 'cash',
    });
    await saveLastSelectedWalletContext('wallet_archived');
    await archiveActiveWallet('wallet_archived');

    renderTransactionsPage();

    const selector = await screen.findByLabelText('Select wallet context');
    await waitFor(() => {
      expect((selector as HTMLSelectElement).value).toBe('all');
    });
    expect(screen.queryByRole('option', { name: 'Old Wallet' })).not.toBeInTheDocument();

    await expect(getLastSelectedWalletContext()).resolves.toBe('all');
  });

  it('opens actions menu and navigates to transfer and adjustment routes', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_b',
      name: 'Bank',
      initialBalance: 50_00,
      iconKey: 'bank',
    });

    renderTransactionsPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Open actions menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Transfer' }));

    expect(await screen.findByRole('heading', { name: 'Transfer Route' })).toBeInTheDocument();
  });

  it('opens actions menu and navigates to adjustment route', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_b',
      name: 'Bank',
      initialBalance: 50_00,
      iconKey: 'bank',
    });

    renderTransactionsPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Open actions menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Adjust balance' }));

    expect(await screen.findByRole('heading', { name: 'Adjustment Route' })).toBeInTheDocument();
  });

  it('shows validation error instead of navigating when transfer is unavailable', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });

    renderTransactionsPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Open actions menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Transfer' }));

    expect(screen.getByText('At least two active wallets are required for transfer.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Transfer Route' })).not.toBeInTheDocument();
  });

  it('disables transfer action when selected wallet has zero balance', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 0,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_b',
      name: 'Bank',
      initialBalance: 50_00,
      iconKey: 'bank',
    });
    await saveLastSelectedWalletContext('wallet_a');

    renderTransactionsPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Open actions menu' }));
    const transferMenuItem = screen.getByRole('menuitem', { name: 'Transfer' });
    expect(transferMenuItem).toBeDisabled();

    fireEvent.click(transferMenuItem);
    expect(screen.queryByRole('heading', { name: 'Transfer Route' })).not.toBeInTheDocument();
  });

  it('removes inline transfer and adjustment buttons from the page body', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_b',
      name: 'Bank',
      initialBalance: 50_00,
      iconKey: 'bank',
    });

    renderTransactionsPage();

    await screen.findByRole('heading', { name: 'Transactions' });
    expect(screen.queryByRole('link', { name: 'Transfer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Adjustment' })).not.toBeInTheDocument();
  });
});
