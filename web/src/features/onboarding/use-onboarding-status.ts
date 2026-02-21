import { useQuery } from '@tanstack/react-query';
import type { CurrencyCode } from '@/domain/currency';
import { getSelectedCurrency, hasAnyActiveWallet } from '@/domain/services';

type OnboardingStatusData = {
  selectedCurrency: CurrencyCode | null;
  hasWallet: boolean;
};

export const onboardingStatusQueryKey = ['onboarding-status'] as const;

export function useOnboardingStatus(): OnboardingStatusData & { isLoading: boolean } {
  const query = useQuery({
    queryKey: onboardingStatusQueryKey,
    queryFn: async (): Promise<OnboardingStatusData> => {
      const [selectedCurrency, hasWallet] = await Promise.all([
        getSelectedCurrency(),
        hasAnyActiveWallet(),
      ]);

      return {
        selectedCurrency,
        hasWallet,
      };
    },
  });

  return {
    isLoading: query.isLoading,
    selectedCurrency: query.data?.selectedCurrency ?? null,
    hasWallet: query.data?.hasWallet ?? false,
  };
}
