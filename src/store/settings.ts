import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Appearance = 'dark' | 'light' | 'system';

type SettingsState = {
  /** true = simulated device (default so everything is testable without hardware). */
  demoMode: boolean;
  /** Demo only: simulate a missing thigh sensor ("Mode 1 capteur"). */
  demoSingleSensor: boolean;
  /** Dark by default. */
  appearance: Appearance;
  /** Used for the calorie estimate. */
  weightKg: number;
  /** Average distance per detected stride, for distance / calories. */
  strideLengthM: number;
  /** Sessions per week targeted. */
  weeklyGoal: number;
  /** Last real device connected, offered first on the connection screen. */
  lastDevice: { id: string; name: string } | null;
  hasOnboarded: boolean;
  /** Data consent: required to store sessions; revocable at any time. */
  consent: { granted: boolean; at: number | null };
  setDemoMode: (value: boolean) => void;
  setDemoSingleSensor: (value: boolean) => void;
  setAppearance: (value: Appearance) => void;
  setWeightKg: (value: number) => void;
  setStrideLengthM: (value: number) => void;
  setWeeklyGoal: (value: number) => void;
  setLastDevice: (device: { id: string; name: string } | null) => void;
  completeOnboarding: () => void;
  setConsent: (granted: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      demoMode: true,
      demoSingleSensor: false,
      appearance: 'dark',
      weightKg: 70,
      strideLengthM: 1,
      weeklyGoal: 3,
      lastDevice: null,
      hasOnboarded: false,
      consent: { granted: false, at: null },
      setDemoMode: (demoMode) => set({ demoMode }),
      setDemoSingleSensor: (demoSingleSensor) => set({ demoSingleSensor }),
      setAppearance: (appearance) => set({ appearance }),
      setWeightKg: (v) => set({ weightKg: Math.min(200, Math.max(30, v)) }),
      setStrideLengthM: (v) => set({ strideLengthM: Math.round(Math.min(3, Math.max(0.5, v)) * 100) / 100 }),
      setWeeklyGoal: (v) => set({ weeklyGoal: Math.min(7, Math.max(1, v)) }),
      setLastDevice: (lastDevice) => set({ lastDevice }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      setConsent: (granted) => set({ consent: { granted, at: Date.now() } }),
    }),
    {
      name: 'worksafe.settings.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
