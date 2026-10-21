import type { BleError, BleManager, Characteristic, Device, Subscription } from 'react-native-ble-plx';

import { ensureBlePermissions } from './permissions';
import { FrameAssembler, parseFrames } from './parser';
import {
  NUS_RX_UUID,
  NUS_SERVICE_UUID,
  NUS_TX_UUID,
  type BleCommand,
  type BleDevice,
  type BleService,
  type ConnectionState,
  type Frame,
  type Unsubscribe,
} from './types';

const IDLE: ConnectionState = { status: 'idle', device: null, message: null };
/** The firmware asks for 185; frames are ~80-130 bytes, so 23 would truncate them. */
const REQUESTED_MTU = 185;
const SCAN_TIMEOUT_MS = 12_000;
/** Chunks of one frame arrive within milliseconds; a longer silence ends the frame. */
const ASSEMBLE_IDLE_MS = 120;

type BlePlx = typeof import('react-native-ble-plx');

/** Loads the native module lazily: it does not exist in Expo Go. */
function loadBlePlx(): BlePlx | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native-ble-plx') as BlePlx;
    return typeof mod.BleManager === 'function' ? mod : null;
  } catch {
    return null;
  }
}

/** True when the BLE native module is present (development build). */
export function isNativeBleAvailable(): boolean {
  const mod = loadBlePlx();
  if (!mod) return false;
  try {
    // Creating a manager throws when the native side is missing (Expo Go).
    const probe = new mod.BleManager();
    void probe.destroy();
    return true;
  } catch {
    return false;
  }
}

function toBase64(text: string): string {
  return btoa(text);
}

/** Notifications carry base64 of ASCII text. */
function fromBase64(b64: string): string {
  return atob(b64);
}

/**
 * Real WorkSafe device over the Nordic UART Service.
 *  - Scans for the NUS service UUID (the board advertises it as "WorkSafe").
 *  - Subscribes to TX notifications, parses one frame per second.
 *  - Writes "C" (calibration) / "M" (toggle buzzer mute) to RX.
 */
export class RealBleService implements BleService {
  readonly kind = 'real' as const;

  private manager: BleManager | null = null;
  private state: ConnectionState = IDLE;
  private readonly stateListeners = new Set<(s: ConnectionState) => void>();
  private readonly frameListeners = new Set<(f: Frame) => void>();
  private device: Device | null = null;
  private monitor: Subscription | null = null;
  private disconnectSub: Subscription | null = null;
  private scanTimer: ReturnType<typeof setTimeout> | null = null;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly assembler = new FrameAssembler();
  private userDisconnect = false;

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

  private fail(message: string): void {
    this.setState({ status: 'error', device: null, message });
  }

  /** Creates the native manager on first use. Returns null (and reports) if unavailable. */
  private getManager(): BleManager | null {
    if (this.manager) return this.manager;
    const mod = loadBlePlx();
    if (!mod) {
      this.fail("Le Bluetooth n'est pas disponible dans Expo Go. Utilisez un build de développement.");
      return null;
    }
    try {
      this.manager = new mod.BleManager();
      return this.manager;
    } catch {
      this.fail("Le Bluetooth n'est pas disponible dans Expo Go. Utilisez un build de développement.");
      return null;
    }
  }

  /** Waits (max 4 s) for the phone's Bluetooth radio to be on. */
  private async waitPoweredOn(manager: BleManager): Promise<boolean> {
    const first = await manager.state();
    if (first === 'PoweredOn') return true;
    if (first === 'Unauthorized') {
      this.fail("Autorisation Bluetooth refusée. Activez-la dans les réglages de l'iPhone ou du téléphone.");
      return false;
    }
    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        sub.remove();
        this.fail('Le Bluetooth est désactivé. Activez-le puis réessayez.');
        resolve(false);
      }, 4000);
      const sub = manager.onStateChange((s) => {
        if (s === 'PoweredOn') {
          clearTimeout(timer);
          sub.remove();
          resolve(true);
        }
      }, true);
    });
  }

  async startScan(onDevice: (device: BleDevice) => void): Promise<void> {
    this.stopScan();
    const permission = await ensureBlePermissions();
    if (permission !== 'granted') {
      this.fail(
        permission === 'blocked'
          ? 'Autorisation Bluetooth bloquée. Ouvrez les réglages de l’application pour l’activer.'
          : 'Autorisation Bluetooth refusée. Elle est nécessaire pour trouver la genouillère.',
      );
      return;
    }
    const manager = this.getManager();
    if (!manager) return;
    if (!(await this.waitPoweredOn(manager))) return;

    this.setState({ status: 'scanning', device: null, message: null });
    manager.startDeviceScan([NUS_SERVICE_UUID], { allowDuplicates: false }, (error: BleError | null, found: Device | null) => {
      if (error) {
        this.fail(`Recherche interrompue : ${error.message}`);
        return;
      }
      if (found) {
        onDevice({ id: found.id, name: found.localName ?? found.name ?? 'WorkSafe', rssi: found.rssi });
      }
    });
    this.scanTimer = setTimeout(() => this.stopScan(), SCAN_TIMEOUT_MS);
  }

  stopScan(): void {
    if (this.scanTimer) clearTimeout(this.scanTimer);
    this.scanTimer = null;
    this.manager?.stopDeviceScan();
    if (this.state.status === 'scanning') this.setState({ ...this.state, status: 'idle' });
  }

  async connect(deviceId: string): Promise<void> {
    const manager = this.getManager();
    if (!manager) throw new Error(this.state.message ?? 'Bluetooth indisponible.');
    this.stopScan();
    this.userDisconnect = false;
    this.setState({ status: 'connecting', device: { id: deviceId, name: 'WorkSafe', rssi: null }, message: null });

    try {
      const connected = await manager.connectToDevice(deviceId, { requestMTU: REQUESTED_MTU, timeout: 12_000 });
      const ready = await connected.discoverAllServicesAndCharacteristics();
      this.device = ready;
      const info: BleDevice = { id: ready.id, name: ready.localName ?? ready.name ?? 'WorkSafe', rssi: ready.rssi };

      this.disconnectSub?.remove();
      this.disconnectSub = ready.onDisconnected(() => {
        this.cleanupConnection();
        this.setState({
          status: 'disconnected',
          device: null,
          message: this.userDisconnect ? null : 'Connexion perdue avec la genouillère.',
        });
      });

      this.assembler.reset();
      this.monitor?.remove();
      this.monitor = ready.monitorCharacteristicForService(NUS_SERVICE_UUID, NUS_TX_UUID, (error, characteristic) =>
        this.onNotification(error, characteristic),
      );
      this.setState({ status: 'connected', device: info, message: null });
    } catch (e) {
      this.cleanupConnection();
      const message = e instanceof Error ? e.message : 'Connexion impossible.';
      this.fail(`Connexion impossible : ${message}`);
      throw new Error(message);
    }
  }

  private onNotification(error: BleError | null, characteristic: Characteristic | null): void {
    if (error || !characteristic?.value) return; // disconnect is reported by onDisconnected
    this.assembler.push(fromBase64(characteristic.value));
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => this.flushFrames(), ASSEMBLE_IDLE_MS);
  }

  private flushFrames(): void {
    this.flushTimer = null;
    const text = this.assembler.flush();
    if (!text) return;
    const receivedAt = Date.now();
    for (const parsed of parseFrames(text)) {
      const frame: Frame = { ...parsed, receivedAt };
      this.frameListeners.forEach((l) => l(frame));
    }
  }

  private cleanupConnection(): void {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = null;
    this.monitor?.remove();
    this.monitor = null;
    this.disconnectSub?.remove();
    this.disconnectSub = null;
    this.device = null;
    this.assembler.reset();
  }

  async disconnect(): Promise<void> {
    this.userDisconnect = true;
    const id = this.device?.id ?? this.state.device?.id;
    this.cleanupConnection();
    if (id && this.manager) {
      try {
        await this.manager.cancelDeviceConnection(id);
      } catch {
        // Already disconnected.
      }
    }
    this.setState({ status: 'disconnected', device: null, message: null });
  }

  async sendCommand(command: BleCommand): Promise<void> {
    if (!this.device || this.state.status !== 'connected') {
      throw new Error('Aucun appareil connecté.');
    }
    try {
      await this.device.writeCharacteristicWithResponseForService(NUS_SERVICE_UUID, NUS_RX_UUID, toBase64(command));
    } catch (e) {
      throw new Error(e instanceof Error ? `Commande non envoyée : ${e.message}` : 'Commande non envoyée.');
    }
  }

  destroy(): void {
    this.cleanupConnection();
    if (this.scanTimer) clearTimeout(this.scanTimer);
    this.stateListeners.clear();
    this.frameListeners.clear();
    void this.manager?.destroy();
    this.manager = null;
  }
}
