import Dexie, { type Table } from 'dexie';

export type CurrencyPreferenceRow = {
  id: string;
  currencyCode: string;
  currencySymbol: string;
  createdAt: string;
  updatedAt: string;
};

export type WalletRow = {
  id: string;
  name: string;
  initialBalance: number;
  iconKey: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AppStateRow = {
  id: string;
  selectedWalletContext: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TransactionRow = {
  id: string;
  type: string;
  walletId: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  transferId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OutboxRow = {
  id: string;
  operationType: string;
  entityType: string;
  entityId: string;
  payload: unknown;
  status: 'pending' | 'processing' | 'failed';
  createdAt: string;
  updatedAt: string;
};

class PersonalFinanceDexie extends Dexie {
  user_preferences!: Table<CurrencyPreferenceRow, string>;
  wallets!: Table<WalletRow, string>;
  app_state!: Table<AppStateRow, string>;
  transactions!: Table<TransactionRow, string>;
  outbox!: Table<OutboxRow, string>;

  constructor() {
    super('personal-finance-web.db');

    this.version(1).stores({
      user_preferences: 'id, currencyCode, updatedAt',
      wallets: 'id, archivedAt, createdAt',
      app_state: 'id, selectedWalletContext, updatedAt',
      transactions: 'id, walletId, transferId, [walletId+date], date, createdAt',
      outbox: 'id, status, createdAt, [status+createdAt], entityType, entityId',
    });
  }
}

export const db = new PersonalFinanceDexie();
