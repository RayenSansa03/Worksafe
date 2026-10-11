import test from "node:test";
import assert from "node:assert/strict";
import { evaluateThresholds } from "../src/features/thresholds/evaluate.ts";
import { summarizeSession } from "../src/features/sessions/summary.ts";
import { transitionPhase } from "../src/features/sessions/transitions.ts";

test("threshold evaluation ignores missing measurements and reports configured breaches", () => {
  const thresholds = { flexion: 100, impact: 3, temperature: 38 };
  assert.deepEqual(
    evaluateThresholds({ timestamp: 1, kneeAngleDeg: 101 }, thresholds),
    [
      {
        category: "flexion",
        title: "Flexion supérieure au seuil",
        value: "101°",
        threshold: "100°",
      },
    ],
  );
  assert.deepEqual(evaluateThresholds({ timestamp: 1 }, thresholds), []);
});
test("session summaries handle partial measurements without inventing values", () => {
  const result = summarizeSession("s1", 10, 70, 60, [
    { timestamp: 20, kneeAngleDeg: 40, stepCount: 3 },
    { timestamp: 30, kneeAngleDeg: 60, impactG: 2, stepCount: 4 },
  ]);
  assert.equal(result.avgFlexion, 50);
  assert.equal(result.maxFlexion, 60);
  assert.equal(result.maxImpact, 2);
  assert.equal(result.steps, 7);
  assert.equal(result.samples.length, 2);
});
test("workout lifecycle only permits valid transitions", () => {
  assert.equal(transitionPhase("idle", "start"), "running");
  assert.equal(transitionPhase("running", "pause"), "paused");
  assert.equal(transitionPhase("paused", "resume"), "running");
  assert.equal(transitionPhase("running", "finish"), "completed");
  assert.equal(transitionPhase("idle", "pause"), "idle");
});
