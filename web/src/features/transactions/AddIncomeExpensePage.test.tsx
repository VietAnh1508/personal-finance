import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { closeDatabaseConnection, openDatabaseConnection } from '../../data/database';
import {
  listTransactionsByWalletIds,
  resetLocalAppData,
  saveCurrencyPreference,
  saveLastSelectedWalletContext,
  saveWallet,
} from '../../data/repositories';
import { ToastProvider } from '../feedback/ToastProvider';
import { AddIncomeExpensePage } from './AddIncomeExpensePage';
import { TransactionsPage } from './TransactionsPage';

function renderAddTransactionPage() {
  const router = createMemoryRouter(
    [
      {
        path: '/transactions/add',
        element: <AddIncomeExpensePage />,
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
    { initialEntries: ['/transactions/add'] }
  );

  render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

describe('AddIncomeExpensePage', () => {
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
      initialBalance: 0,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_bank',
      name: 'Bank',
      initialBalance: 0,
      iconKey: 'bank',
    });
    await saveLastSelectedWalletContext('wallet_bank');

    renderAddTransactionPage();

    const walletSelect = (await screen.findByLabelText('Wallet')) as HTMLSelectElement;
    expect(walletSelect.value).toBe('wallet_bank');
  });

  it('leaves wallet empty when current wallet context is all wallets', async () => {
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 0,
      iconKey: 'wallet',
    });
    await saveLastSelectedWalletContext('all');

    renderAddTransactionPage();

    const walletSelect = (await screen.findByLabelText('Wallet')) as HTMLSelectElement;
    expect(walletSelect.value).toBe('');
  });

  it('validates amount and saves an income or expense transaction', async () => {
    await saveCurrencyPreference('USD');
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 0,
      iconKey: 'wallet',
    });
    await saveLastSelectedWalletContext('wallet_cash');

    renderAddTransactionPage();

    fireEvent.change(await screen.findByLabelText('Amount ($)'), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Food' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save transaction' }));

    expect(await screen.findByText('Amount must be greater than 0.')).toBeInTheDocument();
    await expect(listTransactionsByWalletIds(['wallet_cash'])).resolves.toHaveLength(0);

    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '12.34' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-02-20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save transaction' }));

    expect(await screen.findByText('Transaction saved.')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Transactions' })).toBeInTheDocument();
    expect(await screen.findByText('Food')).toBeInTheDocument();

    await waitFor(async () => {
      const transactions = await listTransactionsByWalletIds(['wallet_cash']);
      expect(transactions).toHaveLength(1);
      expect(transactions[0]?.type).toBe('expense');
      expect(transactions[0]?.amount).toBe(1234);
      expect(transactions[0]?.category).toBe('Food');
      expect(transactions[0]?.date).toBe('2026-02-20');
    });
  });
});
