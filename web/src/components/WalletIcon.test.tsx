import { render, screen } from '@testing-library/react';
import { WalletIcon } from './WalletIcon';
import { getWalletHeroIcon } from './wallet-icon-map';

describe('WalletIcon', () => {
  it('maps wallet icon key to heroicon component', () => {
    const Icon = getWalletHeroIcon('wallet');
    render(<Icon data-testid="mapped-icon" />);
    expect(screen.getByTestId('mapped-icon').tagName).toBe('svg');
  });

  it('renders svg for provided icon key', () => {
    render(<WalletIcon iconKey="wallet" data-testid="wallet-icon" className="h-5 w-5" />);

    expect(screen.getByTestId('wallet-icon').tagName).toBe('svg');
  });
});
