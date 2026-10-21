/** French number formatting (decimal comma). `null` stays `null`. */
export function fmt(value: number | null | undefined, digits = 0): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return value.toFixed(digits).replace('.', ',');
}

/** "+1,2" / "-0,4" with an explicit sign. */
export function fmtSigned(value: number | null | undefined, digits = 1): string | null {
  const s = fmt(value, digits);
  if (s === null || value === null || value === undefined) return null;
  return value >= 0 ? `+${s}` : s;
}
