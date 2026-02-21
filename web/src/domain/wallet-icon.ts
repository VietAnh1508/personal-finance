const DEFAULT_WALLET_HERO_ICON_NAME = 'WalletIcon';

export const WALLET_ICON_OPTIONS = [
  { key: 'wallet', label: 'Wallet', heroIcon: 'WalletIcon' },
  { key: 'bank', label: 'Bank', heroIcon: 'BuildingLibraryIcon' },
  { key: 'cash', label: 'Cash', heroIcon: 'BanknotesIcon' },
  { key: 'card', label: 'Card', heroIcon: 'CreditCardIcon' },
  { key: 'savings', label: 'Savings', heroIcon: 'CircleStackIcon' },
] as const;

export type WalletIconKey = (typeof WALLET_ICON_OPTIONS)[number]['key'];
export type WalletHeroIconName = (typeof WALLET_ICON_OPTIONS)[number]['heroIcon'];

export function isSupportedWalletIconKey(value: string): value is WalletIconKey {
  return WALLET_ICON_OPTIONS.some((option) => option.key === value);
}

export function getWalletHeroIconName(iconKey: WalletIconKey): WalletHeroIconName {
  return (
    WALLET_ICON_OPTIONS.find((option) => option.key === iconKey)
      ?.heroIcon ?? DEFAULT_WALLET_HERO_ICON_NAME
  );
}
