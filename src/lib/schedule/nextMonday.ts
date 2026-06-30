/** Next Monday at UTC midnight (always strictly in the future). */
export function getNextMondayDate(now = new Date()): Date {
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const isoDay = today.getUTCDay() || 7;
  const daysUntil = 8 - isoDay;
  const next = new Date(today);
  next.setUTCDate(next.getUTCDate() + daysUntil);
  return next;
}

export function formatNextMondayShort(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
