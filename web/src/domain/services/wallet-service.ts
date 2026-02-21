import {
  type ActiveWallet,
  editWallet,
  archiveActiveWallet,
  getDefaultActiveWallet,
  getLastSelectedWalletContext,
  hasActiveWallet,
  listActiveWallets,
  listArchivedWallets,
  saveLastSelectedWalletContext,
  saveWallet,
} from '../../data/repositories';
import { type WalletIconKey, isSupportedWalletIconKey } from '../wallet-icon';

function generateWalletId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `wallet_${crypto.randomUUID()}`;
  }

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

export async function getAllArchivedWallets(): Promise<ActiveWallet[]> {
  return listArchivedWallets();
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
    throw new Error('Initial balance must be an integer');
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

export async function updateWalletDetails(
  walletId: string,
  name: string,
  iconKey: WalletIconKey
): Promise<void> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Wallet name is required');
  }

  if (!isSupportedWalletIconKey(iconKey)) {
    throw new Error('Unsupported wallet icon');
  }

  await editWallet({
    id: walletId,
    name: trimmedName,
    iconKey,
  });
}

export async function archiveWallet(walletId: string): Promise<void> {
  const normalizedWalletId = walletId.trim();
  if (!normalizedWalletId) {
    throw new Error('Wallet id is required');
  }

  await archiveActiveWallet(normalizedWalletId);
}

export async function getLastUsedWalletContext(): Promise<string | null> {
  return getLastSelectedWalletContext();
}

export async function setLastUsedWalletContext(context: 'all' | string): Promise<void> {
  const normalizedContext = context.trim();
  if (!normalizedContext) {
    throw new Error('Wallet context is required');
  }

  await saveLastSelectedWalletContext(normalizedContext);
}
