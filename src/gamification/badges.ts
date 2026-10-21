import type { SessionSummary } from './summary';

export type Totals = {
  sessions: number;
  strides: number;
  seconds: number;
  kcal: number;
  km: number;
};

export type BadgeContext = {
  summary: SessionSummary;
  /** Totals INCLUDING the session that just ended. */
  totals: Totals;
  /** Consecutive days with a session, including today. */
  streakDays: number;
};

export type BadgeDef = {
  id: string;
  title: string;
  description: string;
  /** Ionicons glyph. */
  icon: string;
  /** Gradient used for the unlocked medal. */
  colors: [string, string];
  check: (c: BadgeContext) => boolean;
};

const GOLD: [string, string] = ['#FFD66B', '#F5A524'];
const SKY: [string, string] = ['#8CF3FF', '#3DB5FF'];
const VIOLET: [string, string] = ['#C9B8FF', '#7C5CFF'];
const MINT: [string, string] = ['#9BF6C5', '#2FCB8B'];
const CORAL: [string, string] = ['#FFB199', '#FF6B4A'];

/** Rewards are about consistency and effort, never about health outcomes. */
export const BADGES: BadgeDef[] = [
  { id: 'first-run', title: 'Premier départ', description: 'Terminer votre première séance.', icon: 'flag', colors: SKY, check: (c) => c.totals.sessions >= 1 },
  { id: 'ten-min', title: '10 minutes', description: 'Courir 10 minutes dans une séance.', icon: 'timer', colors: MINT, check: (c) => c.summary.durationS >= 600 },
  { id: 'half-hour', title: 'Demi-heure', description: 'Courir 30 minutes dans une séance.', icon: 'hourglass', colors: GOLD, check: (c) => c.summary.durationS >= 1800 },
  { id: 'strides-500', title: '500 foulées', description: 'Atteindre 500 foulées au total.', icon: 'footsteps', colors: SKY, check: (c) => c.totals.strides >= 500 },
  { id: 'strides-5000', title: '5 000 foulées', description: 'Atteindre 5 000 foulées au total.', icon: 'footsteps', colors: VIOLET, check: (c) => c.totals.strides >= 5000 },
  { id: 'steady', title: 'Cadence régulière', description: 'Régularité de cadence d’au moins 85 % sur 5 minutes.', icon: 'pulse', colors: MINT, check: (c) => (c.summary.regularity ?? 0) >= 85 && c.summary.durationS >= 300 },
  { id: 'calm-run', title: 'Séance sereine', description: 'Terminer 5 minutes sans alerte de niveau 2.', icon: 'leaf', colors: MINT, check: (c) => c.summary.level2Count === 0 && c.summary.durationS >= 300 },
  { id: 'burn-100', title: '100 kcal', description: 'Dépenser environ 100 kcal dans une séance (estimation).', icon: 'flame', colors: CORAL, check: (c) => c.summary.kcal >= 100 },
  { id: 'streak-3', title: 'Série de 3 jours', description: 'Courir 3 jours de suite.', icon: 'calendar', colors: GOLD, check: (c) => c.streakDays >= 3 },
  { id: 'sessions-10', title: '10 séances', description: 'Terminer 10 séances.', icon: 'trophy', colors: GOLD, check: (c) => c.totals.sessions >= 10 },
];

/** Ids of badges that this context unlocks and were not unlocked before. */
export function newlyUnlocked(ctx: BadgeContext, already: Record<string, number>): string[] {
  return BADGES.filter((b) => !(b.id in already) && b.check(ctx)).map((b) => b.id);
}
