/**
 * Formats a Date into Persian weekday + day/month, using the browser/Node's
 * built-in Intl Persian calendar support (no extra dependency needed).
 */
export function formatPersianWeekdayDate(date: Date) {
  const weekday = new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    weekday: "long",
  }).format(date);

  const dayMonth = new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    day: "numeric",
    month: "long",
  }).format(date);

  return { weekday, date: dayMonth };
}

/** Same-day key (in the Persian calendar) for grouping links into issues. */
export function persianDayKey(date: Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

/** "خرداد ۱۴۰۳" style label, for grouping archive issues by month. */
export function persianMonthYearLabel(date: Date) {
  const month = new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    month: "long",
  }).format(date);
  const year = new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    year: "numeric",
  }).format(date);
  return `${month} ${year}`;
}

/** Sortable year-month key, e.g. "1403-03". */
export function persianMonthYearKey(date: Date) {
  const parts = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
    calendar: "persian",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "0";
  const month = parts.find((p) => p.type === "month")?.value ?? "0";
  return `${year}-${month}`;
}
