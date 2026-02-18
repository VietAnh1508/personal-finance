import { getCurrencyPreference, saveCurrencyPreference } from '@/data/repositories';
import { CurrencyCode, isSupportedCurrencyCode } from '@/domain/currency';

export async function getSelectedCurrency(): Promise<CurrencyCode | null> {
  return getCurrencyPreference();
}

export async function selectCurrency(currencyCode: string): Promise<void> {
  if (!isSupportedCurrencyCode(currencyCode)) {
    throw new Error('Unsupported currency code');
  }

  await saveCurrencyPreference(currencyCode);
}
