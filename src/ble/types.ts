/** Nordic UART Service identifiers used by the WorkSafe firmware. */
export const NUS_SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
/** ESP32 -> phone (notify). */
export const NUS_TX_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';
/** Phone -> ESP32 (write). */
export const NUS_RX_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';

export type AlertLevel = 0 | 1 | 2;

/**
 * One telemetry frame (1 Hz), as sent by the WorkSafe firmware:
 * `K:..,V:..,P:..,S:..,C:..,T:..,D:..,N:..,F:XXX` plus optional fields.
 * Every field is nullable: the parser never invents a value for a field
 * that was missing or malformed.
 */
export type ParsedFrame = {
  /** K - knee angle (deg). In single-sensor mode it is the tibia tilt. */
  kneeAngle: number | null;
  /** V - angular velocity (deg/s). */
  angularVelocity: number | null;
  /** P - tibial acceleration peak (g). */
  peakG: number | null;
  /** S - stride count (equipped leg) since calibration. */
  strides: number | null;
  /** C - cadence (strides/min of the equipped leg). */
  cadence: number | null;
  /** T - temperature (deg C). */
  temperature: number | null;
  /** D - temperature delta vs calibration baseline (deg C). */
  tempDelta: number | null;
  /** N - alert level computed by the firmware. */
  alertLevel: AlertLevel | null;
  /** F - triggered-indicator bitmask (sent as 3 hex digits). See constants/flags. */
  flags: number | null;
  /** B - battery voltage (V). Only sent when the board has battery sensing. */
  battery: number | null;
  /** A - autoencoder anomaly score (observation only). Needs AI_PRINT_BLE=1. */
  anomalyScore: number | null;
  /** Y - CNN class index (see constants/flags AI_CLASSES). */
  anomalyType: number | null;
  /** Z - AI fusion state (0 normal, 1 alert with type, 2 alert without type). */
  fusionState: AlertLevel | null;
  /** I - total AI inference time (ms). */
  inferenceMs: number | null;
  /** X - 1 when the thigh sensor is absent. Optional (needs a firmware patch). */
  singleSensor: boolean | null;
  /** U - 1 when the buzzer is muted. Optional (needs a firmware patch). */
  muted: boolean | null;
};

/** A parsed frame plus the phone-side reception time. */
export type Frame = ParsedFrame & {
  /** Date.now() when the frame reached the app. Never trust device time. */
  receivedAt: number;
};

/**
 * True when the firmware reports that the thigh sensor is absent. The stock
 * firmware does not send this (X field): see docs/firmware-patch.md.
 */
export function isSingleSensor(frame: ParsedFrame | null): boolean {
  return frame?.singleSensor === true;
}

export type BleDevice = {
  id: string;
  name: string;
  rssi: number | null;
};

export type ConnectionStatus =
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type ConnectionState = {
  status: ConnectionStatus;
  device: BleDevice | null;
  /** Human-readable reason, set when status is 'error' / 'disconnected'. */
  message: string | null;
};

/** Commands understood by the firmware. Note: "M" TOGGLES the mute state. */
export type BleCommand = 'C' | 'M';

export type Unsubscribe = () => void;

/**
 * Contract shared by the real BLE service and the demo simulator, so that
 * screens never know which one they talk to.
 */
export interface BleService {
  readonly kind: 'real' | 'mock';
  getState(): ConnectionState;
  onState(listener: (state: ConnectionState) => void): Unsubscribe;
  onFrame(listener: (frame: Frame) => void): Unsubscribe;
  /** Starts scanning; `onDevice` fires for each (new or updated) device. */
  startScan(onDevice: (device: BleDevice) => void): Promise<void>;
  stopScan(): void;
  connect(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  /** "C" = calibration, "M" = mute buzzer. Rejects if not connected. */
  sendCommand(command: BleCommand): Promise<void>;
  /** Releases timers / native resources. */
  destroy(): void;
}
