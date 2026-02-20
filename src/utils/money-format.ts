const amountInputPattern = /^\d*(\.\d{0,2})?$/;

export function isValidAmountInput(input: string): boolean {
  return amountInputPattern.test(input);
}

export function formatMinorUnits(
  amount: number,
  currencySymbol: string,
  fractionDigits: number
): string {
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  const majorUnits = (absoluteAmount / 100).toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return `${isNegative ? '-' : ''}${currencySymbol}${majorUnits}`;
}

export function parseAmountToMinorUnits(input: string): number | null {
  const normalized = input.trim().replace(/,/g, '');
  if (!normalized) {
    return 0;
  }

  if (!/^-?\d+(\.\d{0,2})?$/.test(normalized)) {
    return null;
  }

  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.round(numericValue * 100);
}

export function formatAmountInput(rawInput: string): string {
  const normalized = rawInput.replace(/,/g, '');
  if (!normalized) {
    return '';
  }

  const sign = normalized.startsWith('-') ? '-' : '';
  const unsigned = sign ? normalized.slice(1) : normalized;
  const [integerPart = '', decimalPart] = unsigned.split('.');
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '');
  const groupedInteger = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (decimalPart !== undefined) {
    return `${sign}${groupedInteger || '0'}.${decimalPart}`;
  }

  return `${sign}${groupedInteger}`;
}
