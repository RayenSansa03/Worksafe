import type { Measurement, Thresholds } from "../../types";

export type ThresholdBreach = {
  category: "flexion" | "impact" | "temperature";
  title: string;
  value: string;
  threshold: string;
};
export function evaluateThresholds(
  m: Measurement,
  t: Thresholds,
): ThresholdBreach[] {
  const breaches: ThresholdBreach[] = [];
  if (m.kneeAngleDeg !== undefined && m.kneeAngleDeg > t.flexion)
    breaches.push({
      category: "flexion",
      title: "Flexion supérieure au seuil",
      value: `${m.kneeAngleDeg}°`,
      threshold: `${t.flexion}°`,
    });
  if (m.impactG !== undefined && m.impactG > t.impact)
    breaches.push({
      category: "impact",
      title: "Impact élevé enregistré",
      value: `${m.impactG.toFixed(1)} g`,
      threshold: `${t.impact} g`,
    });
  if (
    m.temperatureCelsius !== undefined &&
    m.temperatureCelsius > t.temperature
  )
    breaches.push({
      category: "temperature",
      title: "Température supérieure au seuil",
      value: `${m.temperatureCelsius.toFixed(1)} °C`,
      threshold: `${t.temperature} °C`,
    });
  return breaches;
}
