import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { closeDatabaseConnection, openDatabaseConnection } from '@/data/database';
import {
  getTransactionById,
  listTransactionsByTransferId,
  resetLocalAppData,
  saveCurrencyPreference,
  saveTransaction,
  saveTransferTransactions,
  saveWallet,
} from '@/data/repositories';
import { ToastProvider } from '@/features/feedback/ToastProvider';
import { TransactionDetailPage } from '@/features/transactions/TransactionDetailPage';
import { TransactionsPage } from '@/features/transactions/TransactionsPage';

function renderTransactionDetailPage(transactionId: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/transactions/:id',
        element: <TransactionDetailPage />,
      },
      {
        path: '/transactions',
        element: <TransactionsPage />,
      },
    ],
    { initialEntries: [`/transactions/${transactionId}`] }
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

describe('TransactionDetailPage', () => {
  beforeEach(async () => {
    await openDatabaseConnection();
    await resetLocalAppData();
    await saveCurrencyPreference('USD');
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('loads and edits income-expense transactions, then refreshes list totals', async () => {
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });

    await saveTransaction({
      id: 'txn_expense',
      type: 'expense',
      walletId: 'wallet_cash',
      amount: 20_00,
      category: 'Food',
      date: '2026-02-20',
      note: 'Lunch',
      transferId: null,
    });

    renderTransactionDetailPage('txn_expense');

    expect(await screen.findByRole('heading', { name: 'Edit transaction' })).toBeInTheDocument();
    const walletSelect = (await screen.findByLabelText('Wallet')) as HTMLSelectElement;
    await waitFor(() => {
      expect(walletSelect).toHaveValue('wallet_cash');
    });
    expect((screen.getByLabelText('Type') as HTMLSelectElement).value).toBe('expense');
    expect((screen.getByLabelText('Amount ($)') as HTMLInputElement).value).toBe('20');
    expect((screen.getByLabelText('Category') as HTMLInputElement).value).toBe('Food');
    expect((screen.getByLabelText('Date') as HTMLInputElement).value).toBe('2026-02-20');

    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '10.00' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Groceries' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-02-21' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Transaction updated.')).toBeInTheDocument();
    expect(await screen.findByLabelText('Select wallet context')).toBeInTheDocument();
    expect(await screen.findByText('$90.00')).toBeInTheDocument();
    expect(await screen.findByText('Groceries')).toBeInTheDocument();

    await waitFor(async () => {
      const updated = await getTransactionById('txn_expense');
      expect(updated?.amount).toBe(10_00);
      expect(updated?.category).toBe('Groceries');
      expect(updated?.date).toBe('2026-02-21');
    });
  });

  it('loads adjustment transactions and requires delete confirmation', async () => {
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });

    await saveTransaction({
      id: 'txn_adjustment',
      type: 'adjustment',
      walletId: 'wallet_cash',
      amount: -10_00,
      category: 'Adjustment',
      date: '2026-02-20',
      note: 'Correction',
      transferId: null,
    });

    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockReturnValue(false);

    renderTransactionDetailPage('txn_adjustment');

    expect(await screen.findByRole('heading', { name: 'Edit adjustment' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText('Wallet')).toHaveTextContent('Cash');
    });
    expect((await screen.findByLabelText('Decrease') as HTMLInputElement).checked).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Delete transaction' }));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(await getTransactionById('txn_adjustment')).not.toBeNull();

    confirmSpy.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Delete transaction' }));

    expect(await screen.findByText('Transaction deleted.')).toBeInTheDocument();
    expect(await screen.findByLabelText('Select wallet context')).toBeInTheDocument();
    expect(await screen.findByText('$100.00')).toBeInTheDocument();

    await waitFor(async () => {
      const deleted = await getTransactionById('txn_adjustment');
      expect(deleted).toBeNull();
    });

    confirmSpy.mockRestore();
  });

  it('loads and edits transfer transactions while keeping linked rows consistent', async () => {
    await saveWallet({
      id: 'wallet_cash',
      name: 'Cash',
      initialBalance: 100_00,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_bank',
      name: 'Bank',
      initialBalance: 50_00,
      iconKey: 'bank',
    });
    await saveWallet({
      id: 'wallet_savings',
      name: 'Savings',
      initialBalance: 0,
      iconKey: 'cash',
    });

    await saveTransferTransactions({
      outflow: {
        id: 'txn_transfer_out',
        walletId: 'wallet_cash',
        amount: 20_00,
        category: 'Transfer',
        date: '2026-02-20',
        note: 'Move funds',
        transferId: 'trf_1',
      },
      inflow: {
        id: 'txn_transfer_in',
        walletId: 'wallet_bank',
        amount: 20_00,
        category: 'Transfer',
        date: '2026-02-20',
        note: 'Move funds',
        transferId: 'trf_1',
      },
    });

    renderTransactionDetailPage('txn_transfer_out');

    expect(await screen.findByRole('heading', { name: 'Edit transfer' })).toBeInTheDocument();
    const fromWalletSelect = (await screen.findByLabelText('From wallet')) as HTMLSelectElement;
    await waitFor(() => {
      expect(fromWalletSelect).toHaveValue('wallet_cash');
    });
    expect((screen.getByLabelText('To wallet') as HTMLSelectElement).value).toBe('wallet_bank');
    expect((screen.getByLabelText('Amount ($)') as HTMLInputElement).value).toBe('20');

    fireEvent.change(screen.getByLabelText('From wallet'), { target: { value: 'wallet_savings' } });
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '30.00' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-02-21' } });
    fireEvent.change(screen.getByLabelText('Note (optional)'), { target: { value: 'Updated move' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Transaction updated.')).toBeInTheDocument();
    expect(await screen.findByLabelText('Select wallet context')).toBeInTheDocument();
    expect(await screen.findByText('$150.00')).toBeInTheDocument();

    await waitFor(async () => {
      const transferRows = await listTransactionsByTransferId('trf_1');
      expect(transferRows).toHaveLength(2);
      const outflow = transferRows.find((entry) => entry.type === 'transfer_out');
      const inflow = transferRows.find((entry) => entry.type === 'transfer_in');
      expect(outflow?.walletId).toBe('wallet_savings');
      expect(outflow?.amount).toBe(30_00);
      expect(outflow?.date).toBe('2026-02-21');
      expect(outflow?.note).toBe('Updated move');
      expect(inflow?.walletId).toBe('wallet_bank');
      expect(inflow?.amount).toBe(30_00);
      expect(inflow?.date).toBe('2026-02-21');
      expect(inflow?.note).toBe('Updated move');
    });
  });
});
