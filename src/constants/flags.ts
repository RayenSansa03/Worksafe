/**
 * Bit order of the `F` field, taken from the firmware (lv[0..8]):
 * bit i is set when indicator i is at "attention" (1) or "danger" (2).
 * The mask does not say which of the two levels, only that it triggered.
 */
export const FLAG_LABELS = [
  'Flexion du genou',
  'Hyperextension',
  'Vitesse angulaire',
  'Choc tibial',
  'Échauffement',
  'Rotation hors plan',
  'Hausse des chocs',
  "Baisse d'amplitude",
  'Baisse de cadence',
] as const;

/** Labels of the indicators set in `mask`. */
export function decodeFlags(mask: number | null): string[] {
  if (mask === null) return [];
  return FLAG_LABELS.filter((_, i) => (mask & (1 << i)) !== 0);
}

/** CNN classes, in the order of the model outputs (cnn_config.h). */
export const AI_CLASSES = ['normal', 'fatigue', 'instabilité', 'faux pas', 'hyperextension', 'boiterie'] as const;

export function aiClassLabel(index: number | null): string | null {
  if (index === null) return null;
  return AI_CLASSES[index] ?? `classe ${index}`;
}

/** Rough Li-Po state of charge from voltage (3.3 V empty, 4.2 V full). */
export function batteryPercent(volts: number | null): number | null {
  if (volts === null) return null;
  return Math.round(Math.min(1, Math.max(0, (volts - 3.3) / (4.2 - 3.3))) * 100);
}
