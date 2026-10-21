import { THRESHOLDS } from '@/constants/thresholds';
import type { AlertLevel, ParsedFrame } from './types';

export type DemoOptions = {
  /** Simulate a missing thigh sensor: no knee angle in the frames. */
  singleSensor: boolean;
};

/** Cheap deterministic-ish noise so tests can inject their own RNG. */
export type Rng = () => number;

const BASE_CADENCE = 170; // strides/min
const BASELINE_TEMP = 30.5;
/** Duration of a scripted alert episode and spacing between episodes. */
const EPISODE_MS = 8000;
const EPISODE_EVERY_MS = [45_000, 80_000] as const;

/** Bit positions of the `F` field, same as the firmware (constants/flags.ts). */
const FLAG_BITS = { flexion: 1 << 0, velocity: 1 << 2, shock: 1 << 3, temp: 1 << 4 } as const;

/**
 * Generates realistic 1 Hz telemetry for a ~170 strides/min run:
 *  - knee angle oscillates with the stride cycle (sampled once per second),
 *  - shocks and temperature drift upward as simulated fatigue builds,
 *  - occasional scripted episodes push the alert level to 1 or 2,
 *  - the level follows the firmware rule (1 "danger" or 2 "warn" => 2, 1 "warn" => 1).
 */
export class DemoSignal {
  private elapsedMs = 0;
  private phase = 0;
  private strideAcc = 0;
  private strides = 0;
  private nextEpisodeAt: number;
  private episodeEndsAt = 0;
  private episodeSeverity: 1 | 2 = 1;
  private calibratedAt = 0;

  constructor(
    private readonly rng: Rng = Math.random,
    private readonly options: DemoOptions = { singleSensor: false },
  ) {
    this.nextEpisodeAt = this.randomGap();
  }

  setOptions(options: Partial<DemoOptions>): void {
    Object.assign(this.options, options);
  }

  /** Called when the app sends "C": restarts the fatigue baseline. */
  recalibrate(): void {
    this.calibratedAt = this.elapsedMs;
    this.strides = 0;
    this.strideAcc = 0;
  }

  /** Fatigue factor in [0, 1], ramping over ~10 minutes of running. */
  private fatigue(): number {
    return Math.min(1, (this.elapsedMs - this.calibratedAt) / 600_000);
  }

  private randomGap(): number {
    const [min, max] = EPISODE_EVERY_MS;
    return this.elapsedMs + min + this.rng() * (max - min);
  }

  private noise(amplitude: number): number {
    return (this.rng() - 0.5) * 2 * amplitude;
  }

  /** Advances the simulation by `dtMs` and returns the next 1 Hz frame. */
  next(dtMs = 1000): ParsedFrame {
    this.elapsedMs += dtMs;
    const fatigue = this.fatigue();

    // Stride cycle: one knee flexion cycle per stride of the same leg.
    const cadence = BASE_CADENCE - 9 * fatigue + this.noise(2);
    const cycleHz = cadence / 120;
    this.phase += 2 * Math.PI * cycleHz * (dtMs / 1000);
    this.strideAcc += (cadence / 60) * (dtMs / 1000);
    const whole = Math.floor(this.strideAcc);
    this.strides += whole;
    this.strideAcc -= whole;

    // Episode scheduling.
    if (this.elapsedMs >= this.nextEpisodeAt && this.episodeEndsAt <= this.elapsedMs) {
      this.episodeEndsAt = this.elapsedMs + EPISODE_MS;
      this.episodeSeverity = this.rng() < 0.4 ? 2 : 1;
      this.nextEpisodeAt = this.episodeEndsAt + this.randomGap();
    }
    const inEpisode = this.elapsedMs < this.episodeEndsAt;

    const amplitude = 52 - 10 * fatigue; // flexion range shrinks when tired
    const angle = 8 + amplitude * (0.5 + 0.5 * Math.sin(this.phase)) + 6 * Math.sin(2 * this.phase) + this.noise(1.5);
    const velocity = Math.abs(amplitude * Math.PI * cycleHz * Math.cos(this.phase)) * 1.6 + 40 + this.noise(20);

    let peak = 3.2 + 1.6 * fatigue + this.noise(0.5);
    if (inEpisode) peak = this.episodeSeverity === 2 ? 8.4 + this.noise(0.5) : 5.6 + this.noise(0.3);
    peak = Math.max(0.5, peak);

    const temperature = BASELINE_TEMP + 3.2 * fatigue + this.noise(0.1);
    const tempDelta = temperature - BASELINE_TEMP;

    // Indicators -> level, mirroring the firmware rule (report, section 3.4).
    let warn = 0;
    let danger = 0;
    let flags = 0;
    const rate = (value: number, t: { warn: number; danger: number }, bit: number) => {
      if (value > t.danger) {
        danger++;
        flags |= bit;
      } else if (value > t.warn) {
        warn++;
        flags |= bit;
      }
    };
    rate(angle, THRESHOLDS.kneeFlexion, FLAG_BITS.flexion);
    rate(velocity, THRESHOLDS.angularVelocity, FLAG_BITS.velocity);
    rate(peak, THRESHOLDS.tibialShock, FLAG_BITS.shock);
    rate(tempDelta, THRESHOLDS.tempRise, FLAG_BITS.temp);
    const level: AlertLevel = danger >= 1 || warn >= 2 ? 2 : warn === 1 ? 1 : 0;

    // Observation-only AI: score grows with episodes and fatigue.
    const anomalyScore = Math.max(0, 0.08 + 0.2 * fatigue + (inEpisode ? 0.45 : 0) + this.noise(0.04));
    const aiAlert = anomalyScore > 0.45;
    const fusionState: AlertLevel = !aiAlert ? 0 : inEpisode ? 1 : 2;
    // CNN class: 0 normal, 1 fatigue, 3 faux pas (see constants/flags AI_CLASSES).
    const anomalyType = !aiAlert ? 0 : inEpisode ? 3 : 1;
    const battery = Math.max(3.4, 4.05 - 0.45 * Math.min(1, this.elapsedMs / 3_600_000));

    const single = this.options.singleSensor;
    return {
      // Single-sensor mode: the firmware reports the tibia tilt instead of the knee angle.
      kneeAngle: round(single ? angle * 0.8 : angle, 1),
      angularVelocity: round(velocity, 0),
      peakG: round(peak, 1),
      strides: this.strides,
      cadence: round(cadence, 0),
      temperature: round(temperature, 1),
      tempDelta: round(tempDelta, 1),
      alertLevel: level,
      flags,
      battery: round(battery, 2),
      anomalyScore: round(anomalyScore, 2),
      anomalyType,
      fusionState,
      inferenceMs: round(11 + this.rng() * 3, 1),
      singleSensor: single,
      muted: null,
    };
  }
}

function round(value: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}
