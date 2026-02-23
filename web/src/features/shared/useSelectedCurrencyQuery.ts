import { useQuery } from '@tanstack/react-query';
import type { CurrencyCode } from '@/domain/currency';
import { getSelectedCurrency } from '@/domain/services';

export const selectedCurrencyQueryKey = ['selected-currency'] as const;

export async function getSelectedCurrencyOrDefault(): Promise<CurrencyCode> {
  return (await getSelectedCurrency()) ?? 'USD';
}

export function useSelectedCurrencyQuery() {
  return useQuery({
    queryKey: selectedCurrencyQueryKey,
    queryFn: getSelectedCurrencyOrDefault,
  });
}
