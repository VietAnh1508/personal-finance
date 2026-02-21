export const CURRENCY_OPTIONS = [
  { code: 'USD', label: 'US Dollar', symbol: '$', fractionDigits: 2 },
  { code: 'VND', label: 'Vietnam Dong', symbol: '₫', fractionDigits: 0 },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]['code'];

const CURRENCY_BY_CODE = Object.fromEntries(CURRENCY_OPTIONS.map((currency) => [currency.code, currency])) as Record<
  CurrencyCode,
  (typeof CURRENCY_OPTIONS)[number]
>;

export function isSupportedCurrencyCode(value: string): value is CurrencyCode {
  return value in CURRENCY_BY_CODE;
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCY_BY_CODE[currencyCode].symbol;
}

export function getCurrencyFractionDigits(currencyCode: CurrencyCode): number {
  return CURRENCY_BY_CODE[currencyCode].fractionDigits;
}
