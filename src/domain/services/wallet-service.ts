import {
  ActiveWallet,
  getDefaultActiveWallet,
  hasActiveWallet,
  listActiveWallets,
  saveWallet,
} from '@/data/repositories';
import { WalletIconKey, isSupportedWalletIconKey } from '@/domain/wallet-icon';

function generateWalletId(): string {
  return `wallet_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function hasAnyActiveWallet(): Promise<boolean> {
  return hasActiveWallet();
}

export async function getCurrentWallet(): Promise<ActiveWallet | null> {
  return getDefaultActiveWallet();
}

export async function getAllActiveWallets(): Promise<ActiveWallet[]> {
  return listActiveWallets();
}

export async function createWallet(
  name: string,
  initialBalance: number,
  iconKey: WalletIconKey
): Promise<ActiveWallet> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Wallet name is required');
  }

  if (!Number.isInteger(initialBalance)) {
    throw new Error('Initial balance must be stored as integer minor units');
  }

  if (!isSupportedWalletIconKey(iconKey)) {
    throw new Error('Unsupported wallet icon');
  }

  const wallet: ActiveWallet = {
    id: generateWalletId(),
    name: trimmedName,
    initialBalance,
    iconKey,
  };

  await saveWallet(wallet);
  return wallet;
}
