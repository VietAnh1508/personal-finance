const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  return ISO_DATE_PATTERN.test(value.trim());
}

export function todayIsoDate(): string {
  return formatDateToIso(new Date());
}

export function formatDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string): Date | null {
  const normalized = value.trim();
  if (!isIsoDate(normalized)) {
    return null;
  }

  const [yearPart, monthPart, dayPart] = normalized.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function formatIsoDateForDisplay(isoDate: string): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    return isoDate;
  }

  const day = `${parsed.getDate()}`.padStart(2, '0');
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatIsoDateDayNumber(isoDate: string): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    return isoDate;
  }

  return `${parsed.getDate()}`;
}

export function formatIsoDateWeekdayMonthYear(
  isoDate: string,
  locale = 'en-US'
): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    return isoDate;
  }

  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(parsed);
  const monthYear = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(parsed);

  return `${weekday}, ${monthYear}`;
}

export function formatIsoDateWeekday(isoDate: string, locale = 'en-US'): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    return isoDate;
  }

  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(parsed);
}

export function formatIsoDateMonthYear(isoDate: string, locale = 'en-US'): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    return isoDate;
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}
