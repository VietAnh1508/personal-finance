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
      <label className="pf-label" htmlFor={id}>
        {label}
      </label>
      <select
        className="w-full pf-input"
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
