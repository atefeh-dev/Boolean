const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const

export function toPersian(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)])
}

/**
 * Compact form for counts that can grow large (e.g. filter-chip badges):
 * 950 -> ۹۵۰, 12345 -> ۱۲.۳هزار, 2000000 -> ۲م.
 * Drops a trailing ".0" so round numbers don't get a pointless decimal.
 */
export function toPersianCompact(value: number): string {
  const abs = Math.abs(value)
  const unit = abs >= 1_000_000 ? { div: 1_000_000, suffix: 'م' } : abs >= 1_000 ? { div: 1_000, suffix: 'هزار' } : null

  if (!unit) return toPersian(value)

  const scaled = value / unit.div
  const rounded = scaled >= 10 ? Math.round(scaled) : Math.round(scaled * 10) / 10
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return toPersian(text) + unit.suffix
}
