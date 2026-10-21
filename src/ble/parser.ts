import type { AlertLevel, ParsedFrame } from './types';

/**
 * Tolerant parser for the WorkSafe telemetry line.
 *
 * The exact separator is not documented, so the parser accepts commas,
 * semicolons, pipes, whitespace and newlines (and optional wrappers like
 * `{...}`), keys in any case, `:` or `=` between key and value, and any
 * subset / order of fields. Missing or malformed fields become `null`.
 */

const EMPTY_FRAME: ParsedFrame = {
  kneeAngle: null,
  angularVelocity: null,
  peakG: null,
  strides: null,
  cadence: null,
  temperature: null,
  tempDelta: null,
  alertLevel: null,
  flags: null,
  battery: null,
  anomalyScore: null,
  anomalyType: null,
  fusionState: null,
  inferenceMs: null,
  singleSensor: null,
  muted: null,
};

/** key (upper-case) -> field name. */
const KEY_TO_FIELD = {
  K: 'kneeAngle',
  V: 'angularVelocity',
  P: 'peakG',
  S: 'strides',
  C: 'cadence',
  T: 'temperature',
  D: 'tempDelta',
  N: 'alertLevel',
  F: 'flags',
  B: 'battery',
  A: 'anomalyScore',
  Y: 'anomalyType',
  Z: 'fusionState',
  I: 'inferenceMs',
  X: 'singleSensor',
  U: 'muted',
} as const satisfies Record<string, keyof ParsedFrame>;

type Key = keyof typeof KEY_TO_FIELD;

// A token is: <start|separator><letter>[spaces](:|=)<value>
// The leading separator guarantees "KNEE:5" is not read as key K.
const TOKEN_RE = /(^|[\s,;|{[(<])([A-Za-z])\s*[:=]([^\s,;:|{}[\]()<>]*)/g;

const NULL_LITERALS = new Set(['', 'nan', 'null', 'none', 'na', 'n/a', '-', '--', 'inf', '-inf']);

function toNumber(raw: string): number | null {
  if (NULL_LITERALS.has(raw.toLowerCase())) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function toLevel(raw: string): AlertLevel | null {
  const n = toNumber(raw);
  return n === 0 || n === 1 || n === 2 ? n : null;
}

/** The firmware prints F with %03X: parse as hexadecimal. */
function toHexMask(raw: string): number | null {
  const m = /^(?:0x)?([0-9a-f]{1,4})$/i.exec(raw);
  return m ? parseInt(m[1], 16) : null;
}

function toInt(raw: string): number | null {
  const n = toNumber(raw);
  return n !== null && Number.isInteger(n) ? n : null;
}

function toBool(raw: string): boolean | null {
  return raw === '1' ? true : raw === '0' ? false : null;
}

function assign(frame: ParsedFrame, key: Key, raw: string): void {
  switch (key) {
    case 'N':
      frame.alertLevel = toLevel(raw);
      break;
    case 'Z':
      frame.fusionState = toLevel(raw);
      break;
    case 'F':
      frame.flags = toHexMask(raw);
      break;
    case 'Y':
      frame.anomalyType = toInt(raw);
      break;
    case 'I':
      frame.inferenceMs = toNumber(raw);
      break;
    case 'B':
      frame.battery = toNumber(raw);
      break;
    case 'X':
      frame.singleSensor = toBool(raw);
      break;
    case 'U':
      frame.muted = toBool(raw);
      break;
    case 'K':
      frame.kneeAngle = toNumber(raw);
      break;
    case 'V':
      frame.angularVelocity = toNumber(raw);
      break;
    case 'P':
      frame.peakG = toNumber(raw);
      break;
    case 'S':
      frame.strides = toNumber(raw);
      break;
    case 'C':
      frame.cadence = toNumber(raw);
      break;
    case 'T':
      frame.temperature = toNumber(raw);
      break;
    case 'D':
      frame.tempDelta = toNumber(raw);
      break;
    case 'A':
      frame.anomalyScore = toNumber(raw);
      break;
  }
}

/**
 * Parses every frame found in `text`. Line breaks are plain separators (the
 * firmware may use them between fields), so a new frame starts when a key
 * that was already seen in the current frame reappears.
 * Text without any recognised `key:value` pair yields an empty array.
 */
export function parseFrames(text: string): ParsedFrame[] {
  const frames: ParsedFrame[] = [];
  let current: ParsedFrame | null = null;
  const seen = new Set<Key>();

  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    const key = match[2].toUpperCase();
    if (!(key in KEY_TO_FIELD)) continue;
    const k = key as Key;

    if (current === null || seen.has(k)) {
      if (current !== null) frames.push(current);
      current = { ...EMPTY_FRAME };
      seen.clear();
    }
    seen.add(k);
    assign(current, k, match[3]);
  }
  if (current !== null) frames.push(current);
  return frames;
}

/** Parses the first frame in `text`, or `null` if none is recognised. */
export function parseFrame(text: string): ParsedFrame | null {
  return parseFrames(text)[0] ?? null;
}

/**
 * Serialises a frame like the firmware does (`K:1.0,...,F:03A`); null fields
 * are omitted. Used by the demo so it exercises the same parser as hardware.
 */
export function formatFrame(frame: Partial<ParsedFrame>): string {
  const parts: string[] = [];
  for (const [key, field] of Object.entries(KEY_TO_FIELD)) {
    const value = frame[field as keyof ParsedFrame];
    if (value === null || value === undefined) continue;
    if (key === 'F') parts.push(`F:${(value as number).toString(16).toUpperCase().padStart(3, '0')}`);
    else if (typeof value === 'boolean') parts.push(`${key}:${value ? 1 : 0}`);
    else parts.push(`${key}:${value}`);
  }
  return parts.join(',');
}

/**
 * Reassembles notifications split by the BLE MTU (20 bytes by default).
 * The separator is unknown, so the caller buffers chunks with `push` and
 * calls `flush` after a short idle delay (frames come once per second, so
 * chunks of the same frame arrive within a few milliseconds).
 */
export class FrameAssembler {
  private buffer = '';

  push(chunk: string): void {
    this.buffer += chunk;
  }

  /** Returns the buffered text (or null if empty) and clears the buffer. */
  flush(): string | null {
    const text = this.buffer.trim();
    this.buffer = '';
    return text.length > 0 ? text : null;
  }

  reset(): void {
    this.buffer = '';
  }
}
