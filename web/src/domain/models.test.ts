import {
  CURRENCY_OPTIONS,
  getCurrencyFractionDigits,
  getCurrencySymbol,
  isSupportedCurrencyCode,
} from './currency';
import {
  DEFAULT_TRANSACTION_TYPE,
  isTransactionType,
} from './transaction-type';
import {
  getWalletHeroIconName,
  isSupportedWalletIconKey,
  WALLET_ICON_OPTIONS,
} from './wallet-icon';

describe('domain models', () => {
  it('provides currency metadata for supported codes', () => {
    expect(CURRENCY_OPTIONS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'USD', symbol: '$', fractionDigits: 2 }),
        expect.objectContaining({ code: 'VND', symbol: '₫', fractionDigits: 0 }),
      ])
    );
    expect(isSupportedCurrencyCode('USD')).toBe(true);
    expect(isSupportedCurrencyCode('EUR')).toBe(false);
    expect(getCurrencySymbol('USD')).toBe('$');
    expect(getCurrencyFractionDigits('VND')).toBe(0);
  });

  it('keeps transaction type invariants including transfer pairing types', () => {
    expect(DEFAULT_TRANSACTION_TYPE).toBe('adjustment');
    expect(isTransactionType('income')).toBe(true);
    expect(isTransactionType('transfer_out')).toBe(true);
    expect(isTransactionType('transfer_in')).toBe(true);
    expect(isTransactionType('refund')).toBe(false);
  });

  it('maps supported wallet icon keys to Heroicons names', () => {
    expect(WALLET_ICON_OPTIONS.length).toBeGreaterThan(0);
    expect(isSupportedWalletIconKey('wallet')).toBe(true);
    expect(isSupportedWalletIconKey('vault')).toBe(false);
    expect(getWalletHeroIconName('wallet')).toBe('WalletIcon');
  });
});
