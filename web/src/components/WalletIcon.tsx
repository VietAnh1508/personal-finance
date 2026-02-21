import type { SVGProps } from 'react';
import type { WalletIconKey } from '@/domain/wallet-icon';
import { getWalletHeroIcon } from '@/components/wallet-icon-map';

type WalletIconProps = SVGProps<SVGSVGElement> & {
  iconKey: WalletIconKey;
};

export function WalletIcon({ iconKey, ...props }: WalletIconProps) {
  const Icon = getWalletHeroIcon(iconKey);
  return <Icon {...props} />;
}
