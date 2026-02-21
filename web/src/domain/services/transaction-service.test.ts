import { closeDatabaseConnection, openDatabaseConnection } from '../../data/database';
import {
  archiveActiveWallet,
  listTransactionsByWalletIds,
  resetLocalAppData,
  saveWallet,
} from '../../data/repositories';
import { addAdjustmentTransaction, addTransferTransaction } from './transaction-service';

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
});
