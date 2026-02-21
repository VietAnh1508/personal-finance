import { db } from './schema';

export async function getSelectedWalletContextRow(appStateId: string): Promise<string | null> {
  const row = await db.app_state.get(appStateId);
  return row?.selectedWalletContext ?? null;
}

export async function upsertSelectedWalletContextRow(
  appStateId: string,
  selectedWalletContext: string,
  nowIso: string
): Promise<void> {
  const existing = await db.app_state.get(appStateId);

  await db.app_state.put({
    id: appStateId,
    selectedWalletContext,
    createdAt: existing?.createdAt ?? nowIso,
    updatedAt: nowIso,
  });
}
