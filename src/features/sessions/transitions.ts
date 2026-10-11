import type { Phase } from "../../types";
export type WorkoutAction = "start" | "pause" | "resume" | "finish";
export function transitionPhase(phase: Phase, action: WorkoutAction): Phase {
  if (action === "start" && (phase === "idle" || phase === "completed"))
    return "running";
  if (action === "pause" && phase === "running") return "paused";
  if (action === "resume" && phase === "paused") return "running";
  if (action === "finish" && (phase === "running" || phase === "paused"))
    return "completed";
  return phase;
}
