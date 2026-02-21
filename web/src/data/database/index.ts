import {
  getSelectedWalletContextRow,
  upsertSelectedWalletContextRow,
} from "./app-state-operations";
import {
  getStoredCurrencyPreferenceRow,
  upsertCurrencyPreferenceRow,
} from "./currency-preference-operations";
import {
  deleteOutboxRow,
  enqueueOutboxRow,
  listOutboxRowsByStatus,
  updateOutboxRowStatus,
} from "./outbox-operations";
import {
  db,
  type CurrencyPreferenceRow,
  type OutboxRow,
  type TransactionRow,
  type WalletRow,
} from "./schema";
import {
  deleteTransactionRow,
  deleteTransferPairRows,
  getTransactionByIdRow,
  getTransactionsByTransferIdRows,
  getTransactionsByWalletIdsRows,
  insertTransactionRow,
  insertTransferPairRows,
  updateTransactionRow,
  updateTransferPairRows,
} from "./transaction-operations";
import {
  archiveWalletRow,
  getActiveWalletCountRow,
  getActiveWalletRows,
  getArchivedWalletRows,
  getFirstActiveWalletRow,
  insertWalletRow,
  updateWalletRow,
} from "./wallet-operations";

const DEFAULT_PREFERENCE_ID = "default";
const DEFAULT_APP_STATE_ID = "default";

export async function getStoredCurrencyPreference(): Promise<CurrencyPreferenceRow | null> {
  return getStoredCurrencyPreferenceRow(DEFAULT_PREFERENCE_ID);
}

export async function upsertCurrencyPreference(
  params: Pick<CurrencyPreferenceRow, "currencyCode" | "currencySymbol">,
): Promise<void> {
  const nowIso = new Date().toISOString();
  await upsertCurrencyPreferenceRow(params, DEFAULT_PREFERENCE_ID, nowIso);
}

export async function insertWallet(params: {
  id: string;
  name: string;
  initialBalance: number;
  iconKey: string;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  await insertWalletRow(params, nowIso);
}

export async function updateWallet(params: {
  id: string;
  name: string;
  iconKey: string;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  await updateWalletRow(params, nowIso);
}

export async function archiveWallet(params: { id: string }): Promise<void> {
  const nowIso = new Date().toISOString();
  await archiveWalletRow(params, nowIso);
}

export async function getActiveWalletCount(): Promise<number> {
  return getActiveWalletCountRow();
}

export async function getFirstActiveWallet(): Promise<WalletRow | null> {
  return getFirstActiveWalletRow();
}

export async function getActiveWallets(): Promise<WalletRow[]> {
  return getActiveWalletRows();
}

export async function getArchivedWallets(): Promise<WalletRow[]> {
  return getArchivedWalletRows();
}

export async function getSelectedWalletContext(): Promise<string | null> {
  return getSelectedWalletContextRow(DEFAULT_APP_STATE_ID);
}

export async function upsertSelectedWalletContext(
  selectedWalletContext: string,
): Promise<void> {
  const nowIso = new Date().toISOString();
  await upsertSelectedWalletContextRow(
    DEFAULT_APP_STATE_ID,
    selectedWalletContext,
    nowIso,
  );
}

export async function insertTransaction(params: {
  id: string;
  type: string;
  walletId: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  transferId: string | null;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  await insertTransactionRow(params, nowIso);
}

export async function getTransactionsByWalletIds(
  walletIds: string[],
): Promise<TransactionRow[]> {
  return getTransactionsByWalletIdsRows(walletIds);
}

export async function getTransactionById(
  id: string,
): Promise<TransactionRow | null> {
  return getTransactionByIdRow(id);
}

export async function getTransactionsByTransferId(
  transferId: string,
): Promise<TransactionRow[]> {
  return getTransactionsByTransferIdRows(transferId);
}

export async function insertTransferPair(params: {
  outflow: {
    id: string;
    walletId: string;
    amount: number;
    category: string;
    date: string;
    note: string | null;
    transferId: string;
  };
  inflow: {
    id: string;
    walletId: string;
    amount: number;
    category: string;
    date: string;
    note: string | null;
    transferId: string;
  };
}): Promise<void> {
  const nowIso = new Date().toISOString();
  await insertTransferPairRows(params, nowIso);
}

export async function updateTransaction(params: {
  id: string;
  type: string;
  walletId: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  await updateTransactionRow(params, nowIso);
}

export async function updateTransferPair(params: {
  transferId: string;
  outflow: {
    walletId: string;
    amount: number;
    date: string;
    note: string | null;
  };
  inflow: {
    walletId: string;
    amount: number;
    date: string;
    note: string | null;
  };
}): Promise<void> {
  const nowIso = new Date().toISOString();
  await updateTransferPairRows(params, nowIso);
}

export async function deleteTransaction(id: string): Promise<void> {
  await deleteTransactionRow(id);
}

export async function deleteTransferPair(transferId: string): Promise<void> {
  await deleteTransferPairRows(transferId);
}

export async function enqueueOutboxOperation(params: {
  id: string;
  operationType: string;
  entityType: string;
  entityId: string;
  payload: unknown;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  await enqueueOutboxRow(params, nowIso);
}

export async function listPendingOutboxOperations(): Promise<OutboxRow[]> {
  return listOutboxRowsByStatus("pending");
}

export async function setOutboxOperationStatus(
  id: string,
  status: OutboxRow["status"],
): Promise<void> {
  const nowIso = new Date().toISOString();
  await updateOutboxRowStatus(id, status, nowIso);
}

export async function removeOutboxOperation(id: string): Promise<void> {
  await deleteOutboxRow(id);
}

export async function clearAppData(): Promise<void> {
  await db.transaction(
    "rw",
    [db.transactions, db.wallets, db.user_preferences, db.app_state, db.outbox],
    async () => {
      await db.transactions.clear();
      await db.wallets.clear();
      await db.user_preferences.clear();
      await db.app_state.clear();
      await db.outbox.clear();
    },
  );
}

export async function closeDatabaseConnection(): Promise<void> {
  db.close();
}

export async function openDatabaseConnection(): Promise<void> {
  if (!db.isOpen()) {
    await db.open();
  }
}
