import { DemoSignal } from './DemoSignal';
import { MockBleService } from './MockBleService';
import type { Frame } from './types';

function seeded(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('DemoSignal', () => {
  it('produces ~170 strides/min and an oscillating angle', () => {
    const sig = new DemoSignal(seeded());
    const frames = Array.from({ length: 60 }, () => sig.next());
    const cadences = frames.map((f) => f.cadence as number);
    expect(Math.min(...cadences)).toBeGreaterThan(160);
    expect(Math.max(...cadences)).toBeLessThan(180);

    const angles = frames.map((f) => f.kneeAngle as number);
    expect(Math.max(...angles) - Math.min(...angles)).toBeGreaterThan(20);

    // ~170 strides/min => ~170 after one minute.
    expect(frames[59].strides).toBeGreaterThan(150);
    expect(frames[59].strides).toBeLessThan(190);
  });

  it('raises alerts occasionally and keeps levels in 0..2', () => {
    const sig = new DemoSignal(seeded(7));
    const levels = Array.from({ length: 600 }, () => sig.next().alertLevel);
    expect(levels.every((l) => l === 0 || l === 1 || l === 2)).toBe(true);
    expect(levels.some((l) => l !== 0)).toBe(true);
    expect(levels.some((l) => l === 0)).toBe(true);
  });

  it('shows progressive fatigue (temperature drifts up)', () => {
    const sig = new DemoSignal(seeded(3));
    const frames = Array.from({ length: 600 }, () => sig.next());
    expect(frames[599].tempDelta as number).toBeGreaterThan(frames[5].tempDelta as number);
  });

  it('flags single-sensor mode and keeps sending the tibia tilt', () => {
    const sig = new DemoSignal(seeded(), { singleSensor: true });
    const f = sig.next();
    expect(f.singleSensor).toBe(true);
    expect(f.kneeAngle).not.toBeNull();
    expect(f.peakG).not.toBeNull();
  });
});

describe('MockBleService', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('scans, connects and streams frames at 1 Hz', async () => {
    const svc = new MockBleService();
    const frames: Frame[] = [];
    svc.onFrame((f) => frames.push(f));

    const found: string[] = [];
    await svc.startScan((d) => found.push(d.id));
    jest.advanceTimersByTime(2000);
    expect(found).toContain('demo-0001');

    const connecting = svc.connect('demo-0001');
    jest.advanceTimersByTime(1000);
    await connecting;
    expect(svc.getState().status).toBe('connected');

    jest.advanceTimersByTime(3000);
    expect(frames.length).toBe(4); // immediate + 3 ticks
    expect(frames[0].receivedAt).toBeGreaterThan(0);

    await svc.disconnect();
    jest.advanceTimersByTime(3000);
    expect(frames.length).toBe(4);
    svc.destroy();
  });

  it('toggles the mute state on "M" like the firmware and pauses frames during calibration', async () => {
    const svc = new MockBleService();
    const frames: Frame[] = [];
    svc.onFrame((f) => frames.push(f));
    const p = svc.connect('demo-0001');
    jest.advanceTimersByTime(1000);
    await p;
    expect(svc.isMuted()).toBe(false);
    await svc.sendCommand('M');
    expect(svc.isMuted()).toBe(true);
    await svc.sendCommand('M');
    expect(svc.isMuted()).toBe(false);

    const before = frames.length;
    await svc.sendCommand('C');
    jest.advanceTimersByTime(2000);
    expect(frames.length).toBe(before); // blocked during calibration, like the real board
    jest.advanceTimersByTime(2000);
    expect(frames.length).toBeGreaterThan(before);
    svc.destroy();
  });

  it('rejects commands when not connected and records them when connected', async () => {
    const svc = new MockBleService();
    await expect(svc.sendCommand('M')).rejects.toThrow();

    const p = svc.connect('demo-0001');
    jest.advanceTimersByTime(1000);
    await p;
    await svc.sendCommand('C');
    await svc.sendCommand('M');
    expect(svc.sentCommands).toEqual(['C', 'M']);
    svc.destroy();
  });
});
