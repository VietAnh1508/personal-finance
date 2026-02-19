import {
  archiveWallet,
  getActiveWalletCount,
  getActiveWallets,
  getArchivedWallets,
  getFirstActiveWallet,
  getSelectedWalletContext,
  insertWallet,
  updateWallet,
  upsertSelectedWalletContext,
} from '@/data/database';
import { WalletIconKey, isSupportedWalletIconKey } from '@/domain/wallet-icon';

export type ActiveWallet = {
  id: string;
  name: string;
  initialBalance: number;
  iconKey: WalletIconKey;
};

export async function saveWallet(params: ActiveWallet): Promise<void> {
  await insertWallet(params);
}

export async function editWallet(params: {
  id: string;
  name: string;
  iconKey: WalletIconKey;
}): Promise<void> {
  await updateWallet(params);
}

export async function archiveActiveWallet(walletId: string): Promise<void> {
  await archiveWallet({ id: walletId });
}

export async function hasActiveWallet(): Promise<boolean> {
  const walletCount = await getActiveWalletCount();
  return walletCount > 0;
}

export async function getDefaultActiveWallet(): Promise<ActiveWallet | null> {
  const wallet = await getFirstActiveWallet();
  if (!wallet) {
    return null;
  }

  const iconKey = isSupportedWalletIconKey(wallet.iconKey) ? wallet.iconKey : 'wallet';

  return {
    id: wallet.id,
    name: wallet.name,
    initialBalance: wallet.initialBalance,
    iconKey,
  };
}

export async function listActiveWallets(): Promise<ActiveWallet[]> {
  const wallets = await getActiveWallets();

  return wallets.map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    initialBalance: wallet.initialBalance,
    iconKey: isSupportedWalletIconKey(wallet.iconKey) ? wallet.iconKey : 'wallet',
  }));
}

export async function listArchivedWallets(): Promise<ActiveWallet[]> {
  const wallets = await getArchivedWallets();

  return wallets.map((wallet) => ({
    id: wallet.id,
    name: wallet.name,
    initialBalance: wallet.initialBalance,
    iconKey: isSupportedWalletIconKey(wallet.iconKey) ? wallet.iconKey : 'wallet',
  }));
}

export async function getLastSelectedWalletContext(): Promise<string | null> {
  return getSelectedWalletContext();
}

export async function saveLastSelectedWalletContext(context: string): Promise<void> {
  await upsertSelectedWalletContext(context);
}
