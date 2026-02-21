import { getStoredCurrencyPreference, upsertCurrencyPreference } from '@/data/database';
import { type CurrencyCode, getCurrencySymbol, isSupportedCurrencyCode } from '@/domain/currency';

export async function getCurrencyPreference(): Promise<CurrencyCode | null> {
  const preference = await getStoredCurrencyPreference();
  if (!preference) {
    return null;
  }

  if (!isSupportedCurrencyCode(preference.currencyCode)) {
    return null;
  }

  return preference.currencyCode;
}

export async function saveCurrencyPreference(currencyCode: CurrencyCode): Promise<void> {
  await upsertCurrencyPreference({
    currencyCode,
    currencySymbol: getCurrencySymbol(currencyCode),
  });
}
