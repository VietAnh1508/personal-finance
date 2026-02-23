import { useQuery } from '@tanstack/react-query';
import type { CurrencyCode } from '@/domain/currency';
import { getAllActiveWallets, getLastUsedWalletContext } from '@/domain/services';
import { getSelectedCurrencyOrDefault } from '@/features/shared/useSelectedCurrencyQuery';

type WalletSummary = {
  id: string;
  name: string;
};

type TransactionFormContextData = {
  wallets: WalletSummary[];
  preselectedWalletId: string;
  currencyCode: CurrencyCode;
};

export const transactionFormContextQueryKey = ['transaction-form-context'] as const;

export function useTransactionFormContextQuery() {
  return useQuery({
    queryKey: transactionFormContextQueryKey,
    queryFn: async (): Promise<TransactionFormContextData> => {
      const [activeWallets, selectedContext, selectedCurrency] = await Promise.all([
        getAllActiveWallets(),
        getLastUsedWalletContext(),
        getSelectedCurrencyOrDefault(),
      ]);

      const preselectedWalletId =
        selectedContext && selectedContext !== 'all' && activeWallets.some((wallet) => wallet.id === selectedContext)
          ? selectedContext
          : '';

      return {
        wallets: activeWallets.map((wallet) => ({
          id: wallet.id,
          name: wallet.name,
        })),
        preselectedWalletId,
        currencyCode: selectedCurrency,
      };
    },
  });
}
