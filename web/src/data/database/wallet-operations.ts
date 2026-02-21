import { db, type WalletRow } from '@/data/database/schema';

export async function insertWalletRow(
  params: {
    id: string;
    name: string;
    initialBalance: number;
    iconKey: string;
  },
  nowIso: string
): Promise<void> {
  await db.wallets.add({
    id: params.id,
    name: params.name,
    initialBalance: params.initialBalance,
    iconKey: params.iconKey,
    archivedAt: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
}

export async function updateWalletRow(
  params: { id: string; name: string; iconKey: string },
  nowIso: string
): Promise<void> {
  const wallet = await db.wallets.get(params.id);
  if (!wallet || wallet.archivedAt) {
    return;
  }

  await db.wallets.put({
    ...wallet,
    name: params.name,
    iconKey: params.iconKey,
    updatedAt: nowIso,
  });
}

export async function archiveWalletRow(params: { id: string }, nowIso: string): Promise<void> {
  const wallet = await db.wallets.get(params.id);
  if (!wallet || wallet.archivedAt) {
    return;
  }

  await db.wallets.put({
    ...wallet,
    archivedAt: nowIso,
    updatedAt: nowIso,
  });
}

export async function getActiveWalletCountRow(): Promise<number> {
  return db.wallets.filter((wallet) => wallet.archivedAt === null).count();
}

export async function getFirstActiveWalletRow(): Promise<WalletRow | null> {
  const rows = await db.wallets.filter((wallet) => wallet.archivedAt === null).sortBy('createdAt');
  return rows[0] ?? null;
}

export async function getActiveWalletRows(): Promise<WalletRow[]> {
  return db.wallets.filter((wallet) => wallet.archivedAt === null).sortBy('createdAt');
}

export async function getArchivedWalletRows(): Promise<WalletRow[]> {
  const rows = await db.wallets.filter((wallet) => wallet.archivedAt !== null).toArray();
  rows.sort((a, b) => (a.archivedAt && b.archivedAt ? b.archivedAt.localeCompare(a.archivedAt) : 0));
  return rows;
}
