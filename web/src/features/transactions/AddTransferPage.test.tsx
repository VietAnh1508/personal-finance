import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { closeDatabaseConnection, openDatabaseConnection } from '@/data/database';
import {
  archiveActiveWallet,
  listTransactionsByWalletIds,
  resetLocalAppData,
  saveCurrencyPreference,
  saveLastSelectedWalletContext,
  saveWallet,
} from '@/data/repositories';
import { ToastProvider } from '@/features/feedback/ToastProvider';
import { AddTransferPage } from '@/features/transactions/AddTransferPage';
import { TransactionsPage } from '@/features/transactions/TransactionsPage';

function renderTransferPage() {
  const router = createMemoryRouter(
    [
      {
        path: '/transactions/transfer',
        element: <AddTransferPage />,
      },
      {
        path: '/transactions',
        element: <TransactionsPage />,
      },
      {
        path: '/transactions/:id',
        element: <h1>Transaction Detail</h1>,
      },
    ],
    { initialEntries: ['/transactions/transfer'] }
  );
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('AddTransferPage', () => {
  beforeEach(async () => {
    await openDatabaseConnection();
    await resetLocalAppData();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('preselects source wallet from current wallet context', async () => {
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_bank',
      name: 'Bank',
      initialBalance: 0,
      iconKey: 'bank',
    });
    await saveLastSelectedWalletContext('wallet_cash');

    renderTransferPage();

    const fromWalletSelect = (await screen.findByLabelText('From wallet')) as HTMLSelectElement;
    await waitFor(() => {
      expect(fromWalletSelect.value).toBe('wallet_cash');
    });
  });

  it('validates same-wallet transfer and saves linked transfer transactions', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_bank',
      name: 'Bank',
      initialBalance: 20_00,
      iconKey: 'bank',
    });
    await saveLastSelectedWalletContext('wallet_cash');

    renderTransferPage();

    const fromWalletSelect = (await screen.findByLabelText('From wallet')) as HTMLSelectElement;
    await waitFor(() => {
      expect(fromWalletSelect.value).toBe('wallet_cash');
    });

    fireEvent.change(await screen.findByLabelText('To wallet'), { target: { value: 'wallet_cash' } });
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '10.00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save transfer' }));

    expect(await screen.findByText('From wallet and to wallet must be different.')).toBeInTheDocument();
    await expect(listTransactionsByWalletIds(['wallet_cash', 'wallet_bank'])).resolves.toHaveLength(0);

    fireEvent.change(screen.getByLabelText('To wallet'), { target: { value: 'wallet_bank' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-02-20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save transfer' }));

    expect(await screen.findByText('Transfer saved.')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Transactions' })).toBeInTheDocument();
    expect(await screen.findByText('$90.00')).toBeInTheDocument();

    await waitFor(async () => {
      const transactions = await listTransactionsByWalletIds(['wallet_cash', 'wallet_bank']);
      expect(transactions).toHaveLength(2);
      expect(transactions.map((entry) => entry.type).sort()).toEqual(['transfer_in', 'transfer_out']);
      expect(new Set(transactions.map((entry) => entry.transferId)).size).toBe(1);
    });
  });

  it('excludes archived wallets from transfer endpoints', async () => {
    await saveWallet({
      id: 'wallet_active',
      name: 'Active Wallet',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_archived',
      name: 'Archived Wallet',
      initialBalance: 100_00,
      iconKey: 'cash',
    });
    await archiveActiveWallet('wallet_archived');

    renderTransferPage();

    const fromWalletSelect = await screen.findByLabelText('From wallet');
    const toWalletSelect = await screen.findByLabelText('To wallet');

    await waitFor(() => {
      expect(fromWalletSelect).toHaveTextContent('Active Wallet');
      expect(toWalletSelect).toHaveTextContent('Active Wallet');
    });
    expect(fromWalletSelect).not.toHaveTextContent('Archived Wallet');
    expect(toWalletSelect).not.toHaveTextContent('Archived Wallet');
  });
});
