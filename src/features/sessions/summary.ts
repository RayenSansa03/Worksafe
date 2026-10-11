import type { Measurement, Session } from "../../types";
export function summarizeSession(
  id: string,
  startedAt: number,
  endedAt: number,
  durationSeconds: number,
  samples: Measurement[],
): Session {
  const flex = samples
      .map((x) => x.kneeAngleDeg)
      .filter((x): x is number => x !== undefined),
    impacts = samples
      .map((x) => x.impactG)
      .filter((x): x is number => x !== undefined);
  return {
    id,
    startedAt,
    endedAt,
    durationSeconds,
    steps: samples.reduce((a, x) => a + (x.stepCount ?? 0), 0),
    avgFlexion: flex.length
      ? Math.round(flex.reduce((a, x) => a + x, 0) / flex.length)
      : 0,
    maxFlexion: flex.length ? Math.max(...flex) : 0,
    maxImpact: impacts.length ? Math.max(...impacts) : 0,
    load: Math.min(
      100,
      Math.round(durationSeconds / 60 + impacts.reduce((a, x) => a + x, 0) * 2),
    ),
    samples,
  };
}
