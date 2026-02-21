import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { closeDatabaseConnection, openDatabaseConnection } from '@/data/database';
import {
  listTransactionsByWalletIds,
  resetLocalAppData,
  saveCurrencyPreference,
  saveLastSelectedWalletContext,
  saveWallet,
} from '@/data/repositories';
import { ToastProvider } from '@/features/feedback/ToastProvider';
import { AddAdjustmentPage } from '@/features/transactions/AddAdjustmentPage';
import { TransactionsPage } from '@/features/transactions/TransactionsPage';

function renderAdjustmentPage() {
  const router = createMemoryRouter(
    [
      {
        path: '/transactions/adjustment',
        element: <AddAdjustmentPage />,
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
    { initialEntries: ['/transactions/adjustment'] }
  );

  render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

describe('AddAdjustmentPage', () => {
  beforeEach(async () => {
    await openDatabaseConnection();
    await resetLocalAppData();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('preselects wallet from current wallet context', async () => {
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
    await saveLastSelectedWalletContext('wallet_bank');

    renderAdjustmentPage();

    const walletSelect = (await screen.findByLabelText('Wallet')) as HTMLSelectElement;
    expect(walletSelect.value).toBe('wallet_bank');
  });

  it('validates non-zero amount and saves a decrease adjustment transaction', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });
    await saveLastSelectedWalletContext('wallet_cash');

    renderAdjustmentPage();

    fireEvent.change(await screen.findByLabelText('Amount ($)'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save adjustment' }));

    expect(await screen.findByText('Amount must be non-zero.')).toBeInTheDocument();
    await expect(listTransactionsByWalletIds(['wallet_cash'])).resolves.toHaveLength(0);

    fireEvent.click(screen.getByLabelText('Decrease'));
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '10.00' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-02-20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save adjustment' }));

    expect(await screen.findByText('Adjustment saved.')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Transactions' })).toBeInTheDocument();
    expect(await screen.findByText('$90.00')).toBeInTheDocument();
    expect((await screen.findAllByText('Adjustment')).length).toBeGreaterThan(0);

    await waitFor(async () => {
      const transactions = await listTransactionsByWalletIds(['wallet_cash']);
      expect(transactions).toHaveLength(1);
      expect(transactions[0]?.type).toBe('adjustment');
      expect(transactions[0]?.amount).toBe(-10_00);
    });
  });
});
