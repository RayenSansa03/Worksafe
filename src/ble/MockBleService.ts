import { DemoSignal } from './DemoSignal';
import { formatFrame, parseFrame } from './parser';
import type {
  BleCommand,
  BleDevice,
  BleService,
  ConnectionState,
  Frame,
  Unsubscribe,
} from './types';

const DEMO_DEVICES: BleDevice[] = [
  { id: 'demo-0001', name: 'WorkSafe-Démo', rssi: -52 },
  { id: 'demo-0002', name: 'WorkSafe-Démo-B', rssi: -78 },
];

const IDLE: ConnectionState = { status: 'idle', device: null, message: null };

export type MockOptions = {
  /** Frame interval in ms (1000 = real firmware rate). */
  intervalMs?: number;
  /** Start without the thigh sensor. */
  singleSensor?: boolean;
};

/**
 * Simulated WorkSafe device. Frames are serialised to the wire format and
 * parsed back, so the demo exercises the same parser as the real device.
 */
export class MockBleService implements BleService {
  readonly kind = 'mock' as const;

  private state: ConnectionState = IDLE;
  private readonly stateListeners = new Set<(s: ConnectionState) => void>();
  private readonly frameListeners = new Set<(f: Frame) => void>();
  private scanTimers: ReturnType<typeof setTimeout>[] = [];
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private streamTimer: ReturnType<typeof setInterval> | null = null;
  /** The real firmware blocks for ~2.2 s while calibrating: no frames meanwhile. */
  private pausedUntil = 0;
  private muted = false;
  private readonly signal: DemoSignal;
  private readonly intervalMs: number;
  /** Commands received, exposed for tests. */
  readonly sentCommands: BleCommand[] = [];

  constructor(options: MockOptions = {}) {
    this.intervalMs = options.intervalMs ?? 1000;
    this.signal = new DemoSignal(Math.random, { singleSensor: options.singleSensor ?? false });
  }

  /** Demo-only control: toggle the "thigh sensor missing" simulation live. */
  setSingleSensor(value: boolean): void {
    this.signal.setOptions({ singleSensor: value });
  }

  /** Simulated buzzer state ("M" toggles it, like the firmware). */
  isMuted(): boolean {
    return this.muted;
  }

  getState(): ConnectionState {
    return this.state;
  }

  onState(listener: (s: ConnectionState) => void): Unsubscribe {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  onFrame(listener: (f: Frame) => void): Unsubscribe {
    this.frameListeners.add(listener);
    return () => this.frameListeners.delete(listener);
  }

  private setState(next: ConnectionState): void {
    this.state = next;
    this.stateListeners.forEach((l) => l(next));
  }

  async startScan(onDevice: (device: BleDevice) => void): Promise<void> {
    this.stopScan();
    this.setState({ ...this.state, status: 'scanning', message: null });
    // Devices "appear" progressively, like a real scan.
    DEMO_DEVICES.forEach((device, i) => {
      this.scanTimers.push(setTimeout(() => onDevice(device), 700 + i * 900));
    });
    this.scanTimers.push(
      setTimeout(() => {
        if (this.state.status === 'scanning') this.setState({ ...this.state, status: 'idle' });
      }, 4000),
    );
  }

  stopScan(): void {
    this.scanTimers.forEach(clearTimeout);
    this.scanTimers = [];
    if (this.state.status === 'scanning') this.setState({ ...this.state, status: 'idle' });
  }

  async connect(deviceId: string): Promise<void> {
    const device = DEMO_DEVICES.find((d) => d.id === deviceId);
    if (!device) throw new Error('Appareil de démonstration introuvable.');
    this.stopScan();
    this.setState({ status: 'connecting', device, message: null });

    await new Promise<void>((resolve) => {
      this.connectTimer = setTimeout(resolve, 900);
    });
    // The user may have cancelled while connecting.
    if (this.state.status !== 'connecting') return;

    this.setState({ status: 'connected', device, message: null });
    this.startStream();
  }

  async disconnect(): Promise<void> {
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.stopStream();
    this.setState({ status: 'disconnected', device: null, message: null });
  }

  async sendCommand(command: BleCommand): Promise<void> {
    if (this.state.status !== 'connected') {
      throw new Error('Aucun appareil connecté.');
    }
    this.sentCommands.push(command);
    if (command === 'C') {
      this.signal.recalibrate();
      this.pausedUntil = Date.now() + 2200;
    } else {
      this.muted = !this.muted;
    }
  }

  destroy(): void {
    this.stopScan();
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.stopStream();
    this.stateListeners.clear();
    this.frameListeners.clear();
  }

  private startStream(): void {
    this.stopStream();
    this.emit();
    this.streamTimer = setInterval(() => this.emit(), this.intervalMs);
  }

  private stopStream(): void {
    if (this.streamTimer) clearInterval(this.streamTimer);
    this.streamTimer = null;
  }

  private emit(): void {
    if (Date.now() < this.pausedUntil) return;
    const wire = formatFrame({ ...this.signal.next(this.intervalMs), muted: this.muted });
    const parsed = parseFrame(wire);
    if (!parsed) return;
    const frame: Frame = { ...parsed, receivedAt: Date.now() };
    this.frameListeners.forEach((l) => l(frame));
  }
}
