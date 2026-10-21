import { create } from 'zustand';

import { CHART_WINDOW_MS } from '@/constants/disclaimers';
import type { AlertLevel, ConnectionState, Frame } from '@/ble/types';

/** One chart sample, kept for the last CHART_WINDOW_MS only. */
export type SeriesPoint = {
  t: number;
  angle: number | null;
  peak: number | null;
};

/** An alert-level change, kept for the session journal. */
export type AlertEvent = {
  t: number;
  from: AlertLevel | null;
  to: AlertLevel;
};

type LiveState = {
  connection: ConnectionState;
  /** Last received frame. Never display it as current once stale. */
  latest: Frame | null;
  series: SeriesPoint[];
  /** Alert changes since the live session started. */
  alertEvents: AlertEvent[];
  buzzerMuted: boolean;
  /** Live-session aggregates (reset with the session). */
  startedAt: number | null;
  peakMax: number | null;
  angleMax: number | null;
  cadenceSum: number;
  cadenceSumSq: number;
  cadenceCount: number;
  setConnection: (connection: ConnectionState) => void;
  pushFrame: (frame: Frame) => void;
  setBuzzerMuted: (muted: boolean) => void;
  /** Clears session aggregates but keeps the connection and the last frame (after calibration). */
  resetStats: () => void;
  reset: () => void;
};

const IDLE: ConnectionState = { status: 'idle', device: null, message: null };

export const useLive = create<LiveState>((set) => ({
  connection: IDLE,
  latest: null,
  series: [],
  alertEvents: [],
  buzzerMuted: false,
  startedAt: null,
  peakMax: null,
  angleMax: null,
  cadenceSum: 0,
  cadenceSumSq: 0,
  cadenceCount: 0,
  setConnection: (connection) => set({ connection }),
  pushFrame: (frame) =>
    set((s) => {
      const cutoff = frame.receivedAt - CHART_WINDOW_MS - 2000;
      const series = [
        ...s.series.filter((p) => p.t >= cutoff),
        { t: frame.receivedAt, angle: frame.kneeAngle, peak: frame.peakG },
      ];

      let alertEvents = s.alertEvents;
      const prev = s.latest?.alertLevel ?? null;
      if (frame.alertLevel !== null && frame.alertLevel !== prev) {
        alertEvents = [...alertEvents, { t: frame.receivedAt, from: prev, to: frame.alertLevel }];
      }
      // "M" toggles the firmware mute. If the board reports it (U), trust it;
      // otherwise keep our own toggle state.
      const buzzerMuted = frame.muted ?? s.buzzerMuted;
      const max = (a: number | null, b: number | null) => (b === null ? a : a === null ? b : Math.max(a, b));
      return {
        latest: frame,
        series,
        alertEvents,
        buzzerMuted,
        startedAt: s.startedAt ?? frame.receivedAt,
        peakMax: max(s.peakMax, frame.peakG),
        angleMax: max(s.angleMax, frame.kneeAngle),
        cadenceSum: s.cadenceSum + (frame.cadence ?? 0),
        cadenceSumSq: s.cadenceSumSq + (frame.cadence ?? 0) ** 2,
        cadenceCount: s.cadenceCount + (frame.cadence === null ? 0 : 1),
      };
    }),
  setBuzzerMuted: (buzzerMuted) => set({ buzzerMuted }),
  resetStats: () =>
    set({
      series: [],
      alertEvents: [],
      startedAt: null,
      peakMax: null,
      angleMax: null,
      cadenceSum: 0,
      cadenceSumSq: 0,
      cadenceCount: 0,
    }),
  reset: () =>
    set({
      latest: null,
      series: [],
      alertEvents: [],
      buzzerMuted: false,
      startedAt: null,
      peakMax: null,
      angleMax: null,
      cadenceSum: 0,
      cadenceSumSq: 0,
      cadenceCount: 0,
    }),
}));
