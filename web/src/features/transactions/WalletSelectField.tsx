import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getAllActiveWallets } from '@/domain/services';

type WalletOption = {
  id: string;
  name: string;
};

type WalletSelectFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (nextValue: string) => void;
  onLoadError?: (message: string) => void;
};

const activeWalletOptionsQueryKey = ['active-wallet-options'] as const;

export function WalletSelectField({
  id,
  label,
  placeholder,
  value,
  onChange,
  onLoadError,
}: WalletSelectFieldProps) {
  const optionsQuery = useQuery({
    queryKey: activeWalletOptionsQueryKey,
    queryFn: async (): Promise<WalletOption[]> => {
      const activeWallets = await getAllActiveWallets();
      return activeWallets.map((wallet) => ({ id: wallet.id, name: wallet.name }));
    },
  });

  useEffect(() => {
    if (!optionsQuery.error) {
      return;
    }

    onLoadError?.(optionsQuery.error instanceof Error ? optionsQuery.error.message : 'Unable to load wallets.');
  }, [onLoadError, optionsQuery.error]);

  const options = optionsQuery.data ?? [];
  const normalizedValue = options.some((option) => option.id === value) ? value : '';

  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-200" htmlFor={id}>
        {label}
      </label>
      <select
        className="w-full rounded-xl border border-slate-300/30 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-amber-300/70 focus:ring-2 focus:ring-amber-300/30"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        required
        value={normalizedValue}>
        <option value="">{placeholder}</option>
        {options.map((wallet) => (
          <option key={wallet.id} value={wallet.id}>
            {wallet.name}
          </option>
        ))}
      </select>
    </div>
  );
}
