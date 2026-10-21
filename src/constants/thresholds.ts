/**
 * Alert thresholds configured in the firmware (report, table 3).
 * They are technical starting points, NOT clinical limits. The app only
 * mirrors the level (N) sent by the device; these values are used by the
 * demo simulator and to scale charts.
 */
export const THRESHOLDS = {
  kneeFlexion: { warn: 120, danger: 140 }, // degrees
  hyperextension: { warn: -5, danger: -10 }, // degrees
  angularVelocity: { warn: 700, danger: 900 }, // degrees/s
  tibialShock: { warn: 5, danger: 8 }, // g
  tempRise: { warn: 2.5, danger: 4 }, // degrees C above calibration baseline
} as const;
