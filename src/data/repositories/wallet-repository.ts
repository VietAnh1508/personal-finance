import { getActiveWalletCount, getFirstActiveWallet, insertWallet } from '@/data/database';
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
