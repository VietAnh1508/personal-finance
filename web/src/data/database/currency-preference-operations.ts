import { db, type CurrencyPreferenceRow } from './schema';

export async function getStoredCurrencyPreferenceRow(
  preferenceId: string
): Promise<CurrencyPreferenceRow | null> {
  const row = await db.user_preferences.get(preferenceId);
  return row ?? null;
}

export async function upsertCurrencyPreferenceRow(
  params: Pick<CurrencyPreferenceRow, 'currencyCode' | 'currencySymbol'>,
  preferenceId: string,
  nowIso: string
): Promise<void> {
  const existing = await db.user_preferences.get(preferenceId);

  await db.user_preferences.put({
    id: preferenceId,
    currencyCode: params.currencyCode,
    currencySymbol: params.currencySymbol,
    createdAt: existing?.createdAt ?? nowIso,
    updatedAt: nowIso,
  });
}
