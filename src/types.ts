export type Measurement = {
  timestamp: number;
  kneeAngleDeg?: number;
  temperatureCelsius?: number;
  impactG?: number;
  stepCount?: number;
};
export type Thresholds = {
  flexion: number;
  impact: number;
  temperature: number;
};
export type Session = {
  id: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  steps: number;
  avgFlexion: number;
  maxFlexion: number;
  maxImpact: number;
  load: number;
  samples: Measurement[];
};
export type AlertItem = {
  id: string;
  category: "flexion" | "impact" | "temperature" | "device";
  title: string;
  value: string;
  threshold: string;
  timestamp: number;
  read: boolean;
};
export type Phase = "idle" | "running" | "paused" | "completed";
