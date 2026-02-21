import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CircleStackIcon,
  CreditCardIcon,
  WalletIcon as HeroWalletIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';
import {
  getWalletHeroIconName,
  type WalletHeroIconName,
  type WalletIconKey,
} from '../domain/wallet-icon';

export type HeroIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const HERO_ICON_BY_NAME: Record<WalletHeroIconName, HeroIconComponent> = {
  WalletIcon: HeroWalletIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  CreditCardIcon,
  CircleStackIcon,
};

export function getWalletHeroIcon(iconKey: WalletIconKey): HeroIconComponent {
  return HERO_ICON_BY_NAME[getWalletHeroIconName(iconKey)];
}
