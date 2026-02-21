import {
  getCurrencyPreference,
  saveCurrencyPreference,
  saveWallet,
  listActiveWallets,
  archiveActiveWallet,
  listArchivedWallets,
  saveLastSelectedWalletContext,
  getLastSelectedWalletContext,
  saveTransaction,
  listTransactionsByWalletIds,
  saveTransferTransactions,
  listTransactionsByTransferId,
  updateTransferTransactions,
  deleteTransferTransactions,
  enqueueOperation,
  listPendingOperations,
  markOperationStatus,
  resetLocalAppData,
} from '@/data/repositories/index';
import { closeDatabaseConnection, openDatabaseConnection } from '@/data/database';

describe('Dexie local-first repositories', () => {
  beforeEach(async () => {
    await openDatabaseConnection();
    await resetLocalAppData();
  });

  it('persists currency preferences across database reopen', async () => {
    await saveCurrencyPreference('USD');
    await closeDatabaseConnection();
    await openDatabaseConnection();

    await expect(getCurrencyPreference()).resolves.toBe('USD');
  });

  it('supports wallet CRUD and selected context persistence', async () => {
    await saveWallet({
      id: 'wallet_a',
      name: 'Cash',
      initialBalance: 120_00,
      iconKey: 'wallet',
    });

    await saveWallet({
      id: 'wallet_b',
      name: 'Bank',
      initialBalance: 500_00,
      iconKey: 'bank',
    });

    await saveLastSelectedWalletContext('wallet_b');
    await archiveActiveWallet('wallet_a');

    const activeWallets = await listActiveWallets();
    const archivedWallets = await listArchivedWallets();

    expect(activeWallets.map((wallet) => wallet.id)).toEqual(['wallet_b']);
    expect(archivedWallets.map((wallet) => wallet.id)).toEqual(['wallet_a']);
    await expect(getLastSelectedWalletContext()).resolves.toBe('wallet_b');
  });

  it('stores transactions and transfer pairs with expected ordering and updates', async () => {
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

    await saveTransaction({
      id: 'txn_1',
      type: 'income',
      walletId: 'wallet_a',
      amount: 100_00,
      category: 'Salary',
      date: '2026-02-20',
      note: null,
      transferId: null,
    });

    await saveTransferTransactions({
      outflow: {
        id: 'txn_2',
        walletId: 'wallet_a',
        amount: 20_00,
        category: 'Transfer',
        date: '2026-02-21',
        note: 'Move funds',
        transferId: 'trf_1',
      },
      inflow: {
        id: 'txn_3',
        walletId: 'wallet_b',
        amount: 20_00,
        category: 'Transfer',
        date: '2026-02-21',
        note: 'Move funds',
        transferId: 'trf_1',
      },
    });

    const walletATransactions = await listTransactionsByWalletIds(['wallet_a']);
    expect(walletATransactions.map((entry) => entry.id)).toEqual(['txn_2', 'txn_1']);

    await updateTransferTransactions({
      transferId: 'trf_1',
      outflow: {
        walletId: 'wallet_a',
        amount: 25_00,
        date: '2026-02-21',
        note: 'Updated transfer',
      },
      inflow: {
        walletId: 'wallet_b',
        amount: 25_00,
        date: '2026-02-21',
        note: 'Updated transfer',
      },
    });

    const transferRows = await listTransactionsByTransferId('trf_1');
    expect(transferRows).toHaveLength(2);
    expect(new Set(transferRows.map((entry) => entry.amount))).toEqual(new Set([25_00]));

    await deleteTransferTransactions('trf_1');
    await expect(listTransactionsByTransferId('trf_1')).resolves.toEqual([]);
  });

  it('supports outbox enqueue and status transitions', async () => {
    await enqueueOperation({
      id: 'op_1',
      operationType: 'create',
      entityType: 'transaction',
      entityId: 'txn_1',
      payload: { id: 'txn_1' },
    });

    await enqueueOperation({
      id: 'op_2',
      operationType: 'update',
      entityType: 'wallet',
      entityId: 'wallet_a',
      payload: { id: 'wallet_a' },
    });

    await markOperationStatus('op_2', 'processing');

    const pending = await listPendingOperations();
    expect(pending.map((op) => op.id)).toEqual(['op_1']);
  });
});
