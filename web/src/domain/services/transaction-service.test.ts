import { closeDatabaseConnection, openDatabaseConnection } from '@/data/database';
import {
  getTransactionById,
  archiveActiveWallet,
  listTransactionsByWalletIds,
  listTransactionsByTransferId,
  resetLocalAppData,
  saveWallet,
} from '@/data/repositories';
import {
  addAdjustmentTransaction,
  addIncomeExpenseTransaction,
  addTransferTransaction,
  deleteTransactionById,
  editAdjustmentTransaction,
  editIncomeExpenseTransaction,
  editTransferTransaction,
} from '@/domain/services/transaction-service';

describe('transaction-service create transfer and adjustment', () => {
  beforeEach(async () => {
    await openDatabaseConnection();
    await resetLocalAppData();
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('creates linked transfer transactions with a shared transfer id', async () => {
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 0,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_b',
      name: 'Bank',
      initialBalance: 0,
      iconKey: 'bank',
    });

    await addTransferTransaction({
      fromWalletId: 'wallet_a',
      toWalletId: 'wallet_b',
      amountMinorUnits: 12_34,
      date: '2026-02-21',
      note: 'Move funds',
    });

    const transactions = await listTransactionsByWalletIds(['wallet_a', 'wallet_b']);
    expect(transactions).toHaveLength(2);

    const transferIds = new Set(transactions.map((transaction) => transaction.transferId));
    expect(transferIds.size).toBe(1);
    expect(transactions.map((transaction) => transaction.type).sort()).toEqual([
      'transfer_in',
      'transfer_out',
    ]);
    expect(transactions.map((transaction) => transaction.category)).toEqual(['Transfer', 'Transfer']);
  });

  it('rejects transfer with same source and destination wallet', async () => {
    await expect(
      addTransferTransaction({
        fromWalletId: 'wallet_a',
        toWalletId: 'wallet_a',
        amountMinorUnits: 10_00,
        date: '2026-02-21',
      })
    ).rejects.toThrow('From wallet and to wallet must be different');
  });

  it('rejects transfer to archived wallet', async () => {
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 0,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_b',
      name: 'Bank',
      initialBalance: 0,
      iconKey: 'bank',
    });
    await archiveActiveWallet('wallet_b');

    await expect(
      addTransferTransaction({
        fromWalletId: 'wallet_a',
        toWalletId: 'wallet_b',
        amountMinorUnits: 10_00,
        date: '2026-02-21',
      })
    ).rejects.toThrow('Archived wallets cannot be used for transfers');
  });

  it('creates an adjustment transaction and supports decrease via negative minor units', async () => {
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 0,
      iconKey: 'wallet',
    });

    await addAdjustmentTransaction({
      walletId: 'wallet_a',
      amountMinorUnits: -9_50,
      date: '2026-02-21',
      note: 'Reconcile',
    });

    const transactions = await listTransactionsByWalletIds(['wallet_a']);
    expect(transactions).toHaveLength(1);
    expect(transactions[0]?.type).toBe('adjustment');
    expect(transactions[0]?.amount).toBe(-9_50);
    expect(transactions[0]?.category).toBe('Adjustment');
  });

  it('rejects zero-value adjustment', async () => {
    await expect(
      addAdjustmentTransaction({
        walletId: 'wallet_a',
        amountMinorUnits: 0,
        date: '2026-02-21',
      })
    ).rejects.toThrow('Amount must be a non-zero integer in minor units');
  });

  it('edits income and expense transactions with type-specific validation', async () => {
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 0,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_b',
      name: 'Bank',
      initialBalance: 0,
      iconKey: 'bank',
    });

    const transactionId = await addIncomeExpenseTransaction({
      walletId: 'wallet_a',
      type: 'expense',
      amountMinorUnits: 12_00,
      category: 'Food',
      date: '2026-02-20',
      note: 'Lunch',
    });

    await editIncomeExpenseTransaction({
      id: transactionId,
      walletId: 'wallet_b',
      type: 'income',
      amountMinorUnits: 45_67,
      category: 'Refund',
      date: '2026-02-21',
      note: 'Reimbursement',
    });

    const updated = await getTransactionById(transactionId);
    expect(updated).not.toBeNull();
    expect(updated?.walletId).toBe('wallet_b');
    expect(updated?.type).toBe('income');
    expect(updated?.amount).toBe(45_67);
    expect(updated?.category).toBe('Refund');
    expect(updated?.date).toBe('2026-02-21');
    expect(updated?.note).toBe('Reimbursement');

    await expect(
      editIncomeExpenseTransaction({
        id: transactionId,
        walletId: 'wallet_b',
        type: 'income',
        amountMinorUnits: 0,
        category: 'Invalid',
        date: '2026-02-21',
      })
    ).rejects.toThrow('Amount must be a positive integer in minor units');
  });

  it('edits adjustments with non-zero amount validation', async () => {
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 0,
      iconKey: 'wallet',
    });

    const transactionId = await addAdjustmentTransaction({
      walletId: 'wallet_a',
      amountMinorUnits: 10_00,
      date: '2026-02-20',
      note: 'Reconcile',
    });

    await editAdjustmentTransaction({
      id: transactionId,
      walletId: 'wallet_a',
      amountMinorUnits: -5_00,
      date: '2026-02-21',
      note: 'Correct',
    });

    const updated = await getTransactionById(transactionId);
    expect(updated).not.toBeNull();
    expect(updated?.type).toBe('adjustment');
    expect(updated?.amount).toBe(-5_00);
    expect(updated?.category).toBe('Adjustment');
    expect(updated?.date).toBe('2026-02-21');
    expect(updated?.note).toBe('Correct');

    await expect(
      editAdjustmentTransaction({
        id: transactionId,
        walletId: 'wallet_a',
        amountMinorUnits: 0,
        date: '2026-02-21',
      })
    ).rejects.toThrow('Amount must be a non-zero integer in minor units');
  });

  it('edits and deletes transfer transactions as an atomic pair', async () => {
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 0,
      iconKey: 'wallet',
    });
    await saveWallet({
      id: 'wallet_b',
      name: 'Bank',
      initialBalance: 0,
      iconKey: 'bank',
    });
    await saveWallet({
      id: 'wallet_c',
      name: 'Savings',
      initialBalance: 0,
      iconKey: 'cash',
    });

    const transferId = await addTransferTransaction({
      fromWalletId: 'wallet_a',
      toWalletId: 'wallet_b',
      amountMinorUnits: 22_00,
      date: '2026-02-20',
      note: 'Initial transfer',
    });

    await editTransferTransaction({
      transferId,
      fromWalletId: 'wallet_c',
      toWalletId: 'wallet_b',
      amountMinorUnits: 30_00,
      date: '2026-02-21',
      note: 'Updated transfer',
    });

    const updatedTransferRows = await listTransactionsByTransferId(transferId);
    expect(updatedTransferRows).toHaveLength(2);
    const outflow = updatedTransferRows.find((entry) => entry.type === 'transfer_out');
    const inflow = updatedTransferRows.find((entry) => entry.type === 'transfer_in');
    expect(outflow?.walletId).toBe('wallet_c');
    expect(inflow?.walletId).toBe('wallet_b');
    expect(outflow?.amount).toBe(30_00);
    expect(inflow?.amount).toBe(30_00);
    expect(outflow?.note).toBe('Updated transfer');
    expect(inflow?.note).toBe('Updated transfer');

    await deleteTransactionById(outflow!.id);
    await expect(listTransactionsByTransferId(transferId)).resolves.toEqual([]);
  });

  it('deletes a non-transfer transaction by id', async () => {
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 0,
      iconKey: 'wallet',
    });

    const transactionId = await addIncomeExpenseTransaction({
      walletId: 'wallet_a',
      type: 'expense',
      amountMinorUnits: 10_00,
      category: 'Food',
      date: '2026-02-20',
    });

    await deleteTransactionById(transactionId);
    const transactions = await listTransactionsByWalletIds(['wallet_a']);
    expect(transactions).toHaveLength(0);
  });
});
