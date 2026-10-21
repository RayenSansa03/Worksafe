import { useLive } from '@/store/live';
import { useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';
import { buildSummary, type SessionSummary } from './summary';

/** Sessions shorter than this are not worth a summary or badges. */
export const MIN_SESSION_S = 10;

/**
 * Closes the live session: builds the summary from the live aggregates,
 * records it in the progress store (totals, streak, badges) and returns it.
 * Returns null when the session was too short.
 */
export function finishLiveSession(now = Date.now()): SessionSummary | null {
  const live = useLive.getState();
  if (live.startedAt === null || live.latest === null) return null;

  const durationS = Math.max(0, Math.round((live.latest.receivedAt - live.startedAt) / 1000));
  if (durationS < MIN_SESSION_S) return null;

  const { weightKg, strideLengthM } = useSettings.getState();
  const summary = buildSummary({
    endedAt: now,
    durationS,
    strides: live.latest.strides ?? 0,
    weightKg,
    strideLengthM,
    cadenceSum: live.cadenceSum,
    cadenceSumSq: live.cadenceSumSq,
    cadenceCount: live.cadenceCount,
    peakMax: live.peakMax,
    level2Count: live.alertEvents.filter((e) => e.to === 2).length,
  });
  useProgress.getState().finishSession(summary);
  return summary;
}
