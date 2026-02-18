import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export const WALLET_ICON_OPTIONS = [
  { key: 'wallet', label: 'Wallet', materialIcon: 'account-balance-wallet' as MaterialIconName },
  { key: 'bank', label: 'Bank', materialIcon: 'account-balance' as MaterialIconName },
  { key: 'cash', label: 'Cash', materialIcon: 'payments' as MaterialIconName },
  { key: 'card', label: 'Card', materialIcon: 'credit-card' as MaterialIconName },
  { key: 'savings', label: 'Savings', materialIcon: 'savings' as MaterialIconName },
] as const;

export type WalletIconKey = (typeof WALLET_ICON_OPTIONS)[number]['key'];

export function isSupportedWalletIconKey(value: string): value is WalletIconKey {
  return WALLET_ICON_OPTIONS.some((option) => option.key === value);
}

export function getWalletMaterialIconName(iconKey: WalletIconKey): MaterialIconName {
  return WALLET_ICON_OPTIONS.find((option) => option.key === iconKey)?.materialIcon ?? 'account-balance-wallet';
}
