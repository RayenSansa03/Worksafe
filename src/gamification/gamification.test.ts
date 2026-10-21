import { BADGES, newlyUnlocked, type BadgeContext } from './badges';
import { motivationFor, sessionPraise, tipOfTheDay } from './motivation';
import { buildSummary, distanceKm, estimateKcal, regularityScore } from './summary';

describe('calories', () => {
  it('computes distance from strides', () => {
    expect(distanceKm(1000, 1)).toBeCloseTo(1, 5);
    expect(distanceKm(-5, 1)).toBe(0);
  });

  it('estimates ~1 kcal per kg per km', () => {
    expect(estimateKcal(70, 5)).toBeCloseTo(362.6, 1);
    expect(estimateKcal(70, 0)).toBe(0);
  });
});

describe('regularity', () => {
  it('is 100 for a constant cadence and needs enough samples', () => {
    expect(regularityScore(170 * 20, 170 * 170 * 20, 20)).toBe(100);
    expect(regularityScore(170 * 5, 170 * 170 * 5, 5)).toBeNull();
  });

  it('decreases with variability', () => {
    // cadence alternating 150 / 190 => cv ~ 0.118 => 0
    const n = 20;
    const sum = 10 * 150 + 10 * 190;
    const sumSq = 10 * 150 ** 2 + 10 * 190 ** 2;
    expect(regularityScore(sum, sumSq, n)).toBe(0);
    // mild variability
    const mild = regularityScore(10 * 168 + 10 * 172, 10 * 168 ** 2 + 10 * 172 ** 2, 20) as number;
    expect(mild).toBeGreaterThan(70);
    expect(mild).toBeLessThan(100);
  });
});

function ctx(over: Partial<BadgeContext> = {}): BadgeContext {
  const summary = buildSummary({
    endedAt: 0,
    durationS: 700,
    strides: 1900,
    weightKg: 70,
    strideLengthM: 1,
    cadenceSum: 170 * 100,
    cadenceSumSq: 170 * 170 * 100,
    cadenceCount: 100,
    peakMax: 5,
    level2Count: 0,
  });
  return { summary, totals: { sessions: 1, strides: 1900, seconds: 700, kcal: 130, km: 1.9 }, streakDays: 1, ...over };
}

describe('badges', () => {
  it('unlocks the expected badges and never twice', () => {
    const first = newlyUnlocked(ctx(), {});
    expect(first).toEqual(expect.arrayContaining(['first-run', 'ten-min', 'strides-500', 'steady', 'calm-run', 'burn-100']));
    expect(first).not.toContain('half-hour');
    const already = Object.fromEntries(first.map((id) => [id, 1]));
    expect(newlyUnlocked(ctx(), already)).toEqual([]);
  });

  it('streak badge needs 3 consecutive days', () => {
    expect(newlyUnlocked(ctx({ streakDays: 3 }), {})).toContain('streak-3');
  });

  it('has unique ids', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });
});

describe('motivation', () => {
  it('never promises injury prevention', () => {
    const all = [
      tipOfTheDay(),
      sessionPraise(90, 1800),
      motivationFor({ hour: 9, streakDays: 3, sessionsThisWeek: 1, weeklyGoal: 3, totalSessions: 5 }).body,
    ].join(' ');
    expect(all.toLowerCase()).not.toMatch(/blessure|préven|prot[èe]ge|soigne/);
  });

  it('adapts to progress', () => {
    expect(motivationFor({ hour: 9, streakDays: 0, sessionsThisWeek: 0, weeklyGoal: 3, totalSessions: 0 }).title).toMatch(/première/);
    expect(motivationFor({ hour: 9, streakDays: 0, sessionsThisWeek: 3, weeklyGoal: 3, totalSessions: 9 }).title).toMatch(/atteint/);
  });
});
