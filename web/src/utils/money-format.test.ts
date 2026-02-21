import {
  formatAmountInput,
  formatMinorUnits,
  isValidAmountInput,
  parseAmountToMinorUnits,
} from '@/utils/money-format';

describe('money-format utils', () => {
  it('validates amount input with up to 2 decimals', () => {
    expect(isValidAmountInput('1234.56')).toBe(true);
    expect(isValidAmountInput('1234.567')).toBe(false);
  });

  it('parses major units to integer minor units', () => {
    expect(parseAmountToMinorUnits('12.34')).toBe(1234);
    expect(parseAmountToMinorUnits('-12.34')).toBe(-1234);
    expect(parseAmountToMinorUnits('')).toBe(0);
  });

  it('formats integer minor units for display', () => {
    expect(formatMinorUnits(1234, '$', 2)).toBe('$12.34');
    expect(formatMinorUnits(-1234, '$', 2)).toBe('-$12.34');
  });

  it('adds thousands separators to user input', () => {
    expect(formatAmountInput('12345')).toBe('12,345');
    expect(formatAmountInput('-0012345.60')).toBe('-12,345.60');
  });
});
