/** Pure helpers that turn live-session aggregates into a summary. */

export type SessionSummary = {
  endedAt: number;
  durationS: number;
  strides: number;
  distanceKm: number;
  kcal: number;
  cadenceAvg: number | null;
  /** 0-100 indicator of how steady the cadence was (not a health metric). */
  regularity: number | null;
  peakMax: number | null;
  /** How many times the level reached 2 during the session. */
  level2Count: number;
};

export type SummaryInput = {
  endedAt: number;
  durationS: number;
  strides: number;
  weightKg: number;
  strideLengthM: number;
  cadenceSum: number;
  cadenceSumSq: number;
  cadenceCount: number;
  peakMax: number | null;
  level2Count: number;
};

/** Distance from stride count and an average stride length (rough estimate). */
export function distanceKm(strides: number, strideLengthM: number): number {
  return (Math.max(0, strides) * strideLengthM) / 1000;
}

/**
 * Running energy estimate: ~1.036 kcal per kg per km (net cost of running).
 * It is an order of magnitude, not a measurement: it depends on the
 * configured stride length and weight, and ignores terrain and speed.
 */
export function estimateKcal(weightKg: number, km: number): number {
  return Math.max(0, weightKg * km * 1.036);
}

/** 100 = perfectly steady cadence; falls to 0 at a 10 % coefficient of variation. */
export function regularityScore(sum: number, sumSq: number, count: number): number | null {
  if (count < 10) return null;
  const mean = sum / count;
  if (mean <= 0) return null;
  const variance = Math.max(0, sumSq / count - mean * mean);
  const cv = Math.sqrt(variance) / mean;
  return Math.round(100 * (1 - Math.min(1, cv / 0.1)));
}

export function buildSummary(i: SummaryInput): SessionSummary {
  const km = distanceKm(i.strides, i.strideLengthM);
  return {
    endedAt: i.endedAt,
    durationS: i.durationS,
    strides: i.strides,
    distanceKm: km,
    kcal: estimateKcal(i.weightKg, km),
    cadenceAvg: i.cadenceCount > 0 ? i.cadenceSum / i.cadenceCount : null,
    regularity: regularityScore(i.cadenceSum, i.cadenceSumSq, i.cadenceCount),
    peakMax: i.peakMax,
    level2Count: i.level2Count,
  };
}
