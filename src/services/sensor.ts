import type { Measurement } from "../types";
export type ConnectionState =
  "disconnected" | "scanning" | "connecting" | "connected" | "error";
export type SensorListener = (measurement: Measurement) => void;
export interface KneeSensorService {
  scanForDevices(): Promise<void>;
  connect(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  startMeasurements(): Promise<void>;
  stopMeasurements(): Promise<void>;
  sendCalibrationCommand(): Promise<void>;
  getConnectionState(): ConnectionState;
  subscribeToMeasurements(listener: SensorListener): () => void;
}
/** Demo-only data generator. Never used by the BLE adapter. */
export function createDemoMeasurement(timestamp = Date.now()): Measurement {
  return {
    timestamp,
    kneeAngleDeg: Math.round(35 + Math.random() * 70),
    temperatureCelsius: Number((31 + Math.random() * 3).toFixed(1)),
    impactG: Number((0.8 + Math.random() * 2.7).toFixed(1)),
    stepCount: Math.random() > 0.55 ? 2 : 1,
  };
}
/** Hardware wiring stays unavailable until the ESP32 GATT UUIDs, payload schema and calibration acknowledgement are documented. */
export class BleKneeSensorService implements KneeSensorService {
  private state: ConnectionState = "disconnected";
  getConnectionState() {
    return this.state;
  }
  private unavailable(): never {
    this.state = "error";
    throw new Error(
      "BLE non configuré : spécifier le service GATT, les caractéristiques, le format des mesures et le protocole de calibration ESP32.",
    );
  }
  async scanForDevices(): Promise<void> {
    this.unavailable();
  }
  async connect(_deviceId: string): Promise<void> {
    this.unavailable();
  }
  async disconnect(): Promise<void> {
    this.state = "disconnected";
  }
  async startMeasurements(): Promise<void> {
    this.unavailable();
  }
  async stopMeasurements(): Promise<void> {}
  async sendCalibrationCommand(): Promise<void> {
    this.unavailable();
  }
  subscribeToMeasurements(_listener: SensorListener): () => void {
    return () => {};
  }
}
