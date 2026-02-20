import { WalletIconKey } from '@/domain/wallet-icon';

export type WalletOption = {
  id: string;
  name: string;
  iconKey: WalletIconKey;
};

export type AdjustmentDirection = 'increase' | 'decrease';
