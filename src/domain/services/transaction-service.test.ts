import {
  deleteTransactionById,
  getTransactionDetails,
  updateAdjustmentTransaction,
  updateIncomeExpenseTransaction,
  updateTransferTransaction,
} from '@/domain/services/transaction-service';
import {
  makeActiveWallet,
  makeTransactionEntry,
  makeTransferPair,
} from '@/domain/services/transaction-service.mock';

jest.mock('@/data/repositories', () => ({
  listTransactionsByWalletIds: jest.fn(),
  saveTransaction: jest.fn(),
  saveTransferTransactions: jest.fn(),
  getTransactionById: jest.fn(),
  listTransactionsByTransferId: jest.fn(),
  updateTransaction: jest.fn(),
  updateTransferTransactions: jest.fn(),
  deleteTransaction: jest.fn(),
  deleteTransferTransactions: jest.fn(),
}));

jest.mock('@/domain/services/wallet-service', () => ({
  getAllActiveWallets: jest.fn(),
}));

const repositories = jest.requireMock('@/data/repositories') as {
  getTransactionById: jest.Mock;
  listTransactionsByTransferId: jest.Mock;
  updateTransaction: jest.Mock;
  updateTransferTransactions: jest.Mock;
  deleteTransaction: jest.Mock;
  deleteTransferTransactions: jest.Mock;
};

const walletService = jest.requireMock('@/domain/services/wallet-service') as {
  getAllActiveWallets: jest.Mock;
};

describe('transaction-service edit/delete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads transfer details with linked transaction', async () => {
    const { outflow, inflow } = makeTransferPair();
    repositories.getTransactionById.mockResolvedValue(outflow);
    repositories.listTransactionsByTransferId.mockResolvedValue([outflow, inflow]);

    const result = await getTransactionDetails('txn_out');

    expect(result?.transaction.id).toBe('txn_out');
    expect(result?.linkedTransaction?.id).toBe('txn_in');
  });

  it('updates transfer pair when editing transfer from transfer_out side', async () => {
    repositories.getTransactionById.mockResolvedValue(
      makeTransactionEntry({
        id: 'txn_out',
        type: 'transfer_out',
        category: 'Transfer',
        transferId: 'trf_1',
      })
    );
    walletService.getAllActiveWallets.mockResolvedValue([
      makeActiveWallet({ id: 'wallet_a' }),
      makeActiveWallet({ id: 'wallet_b' }),
    ]);

    await updateTransferTransaction({
      transactionId: 'txn_out',
      fromWalletId: 'wallet_a',
      toWalletId: 'wallet_b',
      amount: 2500,
      date: '2026-02-21',
      note: 'updated',
    });

    expect(repositories.updateTransferTransactions).toHaveBeenCalledWith({
      transferId: 'trf_1',
      outflow: {
        walletId: 'wallet_a',
        amount: 2500,
        date: '2026-02-21',
        note: 'updated',
      },
      inflow: {
        walletId: 'wallet_b',
        amount: 2500,
        date: '2026-02-21',
        note: 'updated',
      },
    });
  });

  it('deletes both rows when deleting a transfer transaction', async () => {
    repositories.getTransactionById.mockResolvedValue(
      makeTransactionEntry({
        id: 'txn_in',
        type: 'transfer_in',
        walletId: 'wallet_b',
        category: 'Transfer',
        transferId: 'trf_1',
      })
    );

    await deleteTransactionById('txn_in');

    expect(repositories.deleteTransferTransactions).toHaveBeenCalledWith('trf_1');
    expect(repositories.deleteTransaction).not.toHaveBeenCalled();
  });

  it('updates income/expense fields for non-transfer transaction', async () => {
    repositories.getTransactionById.mockResolvedValue(
      makeTransactionEntry({
        id: 'txn_1',
        type: 'expense',
      })
    );

    await updateIncomeExpenseTransaction({
      transactionId: 'txn_1',
      walletId: 'wallet_a',
      type: 'income',
      amount: 2400,
      category: 'Salary',
      date: '2026-02-21',
      note: 'note',
    });

    expect(repositories.updateTransaction).toHaveBeenCalledWith({
      id: 'txn_1',
      walletId: 'wallet_a',
      type: 'income',
      amount: 2400,
      category: 'Salary',
      date: '2026-02-21',
      note: 'note',
    });
  });

  it('updates adjustment transaction fields', async () => {
    repositories.getTransactionById.mockResolvedValue(
      makeTransactionEntry({
        id: 'txn_1',
        type: 'adjustment',
        category: 'Adjustment',
      })
    );

    await updateAdjustmentTransaction({
      transactionId: 'txn_1',
      walletId: 'wallet_a',
      amount: -3400,
      date: '2026-02-21',
      note: 'reconcile',
    });

    expect(repositories.updateTransaction).toHaveBeenCalledWith({
      id: 'txn_1',
      walletId: 'wallet_a',
      type: 'adjustment',
      amount: -3400,
      category: 'Adjustment',
      date: '2026-02-21',
      note: 'reconcile',
    });
  });
});
