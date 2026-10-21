import { useLive } from '@/store/live';
import { useSettings } from '@/store/settings';
import { MockBleService } from './MockBleService';
import { RealBleService } from './RealBleService';
import type { BleService } from './types';

/**
 * Owns the single active BleService (demo or real) and pipes its events into
 * the live store. Screens call `getBleService()`; they never instantiate one.
 */
let service: BleService | null = null;
let unsubscribers: (() => void)[] = [];

function createService(demo: boolean): BleService {
  if (!demo) return new RealBleService();
  return new MockBleService({ singleSensor: useSettings.getState().demoSingleSensor });
}

function attach(next: BleService): void {
  unsubscribers.forEach((u) => u());
  unsubscribers = [
    next.onState((s) => useLive.getState().setConnection(s)),
    next.onFrame((f) => useLive.getState().pushFrame(f)),
  ];
}

export function getBleService(): BleService {
  if (!service) {
    service = createService(useSettings.getState().demoMode);
    attach(service);
  }
  return service;
}

/** Replaces the active service (called when the Demo / Real switch changes). */
export function resetBleService(): void {
  const previous = service;
  service = null;
  useLive.getState().reset();
  useLive.getState().setConnection({ status: 'idle', device: null, message: null });
  if (previous) {
    void previous.disconnect().finally(() => previous.destroy());
  }
  getBleService();
}

/** Keeps the service in sync with settings. Returns an unsubscribe function. */
export function bindBleToSettings(): () => void {
  getBleService();
  return useSettings.subscribe((state, prev) => {
    if (state.demoMode !== prev.demoMode) {
      resetBleService();
    } else if (state.demoSingleSensor !== prev.demoSingleSensor && service instanceof MockBleService) {
      service.setSingleSensor(state.demoSingleSensor);
    }
  });
}
