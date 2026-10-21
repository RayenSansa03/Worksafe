import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newlyUnlocked, type Totals } from '@/gamification/badges';
import type { SessionSummary } from '@/gamification/summary';

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(ms: number): string {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Consecutive days (ending today or yesterday) present in `days`. */
export function streakFrom(days: string[], today: number): number {
  const set = new Set(days);
  let cursor = today;
  // The streak stays alive if the last session was yesterday.
  if (!set.has(dayKey(cursor))) cursor -= 86_400_000;
  let count = 0;
  while (set.has(dayKey(cursor))) {
    count++;
    cursor -= 86_400_000;
  }
  return count;
}

/** Number of sessions in the current Monday-to-Sunday week. */
export function sessionsThisWeek(sessionDays: number[], now: number): number {
  const d = new Date(now);
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7)).getTime();
  return sessionDays.filter((t) => t >= monday).length;
}

type ProgressState = {
  totals: Totals;
  /** End time (ms) of recent sessions, newest last (capped). */
  sessionTimes: number[];
  /** badge id -> unlock time (ms). */
  unlocked: Record<string, number>;
  lastSummary: SessionSummary | null;
  /** Badge ids unlocked by the last finished session. */
  lastNewBadges: string[];
  finishSession: (summary: SessionSummary) => string[];
  clear: () => void;
};

const EMPTY_TOTALS: Totals = { sessions: 0, strides: 0, seconds: 0, kcal: 0, km: 0 };

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      totals: EMPTY_TOTALS,
      sessionTimes: [],
      unlocked: {},
      lastSummary: null,
      lastNewBadges: [],
      finishSession: (summary) => {
        const s = get();
        const totals: Totals = {
          sessions: s.totals.sessions + 1,
          strides: s.totals.strides + summary.strides,
          seconds: s.totals.seconds + summary.durationS,
          kcal: s.totals.kcal + summary.kcal,
          km: s.totals.km + summary.distanceKm,
        };
        const sessionTimes = [...s.sessionTimes, summary.endedAt].slice(-120);
        const streakDays = streakFrom(sessionTimes.map(dayKey), summary.endedAt);
        const ids = newlyUnlocked({ summary, totals, streakDays }, s.unlocked);
        const unlocked = { ...s.unlocked, ...Object.fromEntries(ids.map((id) => [id, summary.endedAt])) };
        set({ totals, sessionTimes, unlocked, lastSummary: summary, lastNewBadges: ids });
        return ids;
      },
      clear: () =>
        set({ totals: EMPTY_TOTALS, sessionTimes: [], unlocked: {}, lastSummary: null, lastNewBadges: [] }),
    }),
    { name: 'worksafe.progress.v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
