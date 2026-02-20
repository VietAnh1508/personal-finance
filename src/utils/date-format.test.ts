import { formatIsoDateForDisplay, parseIsoDate } from '@/utils/date-format';

describe('date-format utils', () => {
  it('parses valid ISO dates', () => {
    const parsed = parseIsoDate('2026-02-20');

    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(1);
    expect(parsed?.getDate()).toBe(20);
  });

  it('returns null for impossible dates', () => {
    expect(parseIsoDate('2026-02-30')).toBeNull();
  });

  it('formats valid ISO date to DD/MM/YYYY', () => {
    expect(formatIsoDateForDisplay('2026-02-20')).toBe('20/02/2026');
  });
});
