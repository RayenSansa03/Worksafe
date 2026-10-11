import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type {
  AlertItem,
  Measurement,
  Phase,
  Session,
  Thresholds,
} from "./types";
import { evaluateThresholds } from "./features/thresholds/evaluate";
import { summarizeSession } from "./features/sessions/summary";
import { transitionPhase } from "./features/sessions/transitions";

const KEY = "worksafe-v1";
type State = {
  hydrated: boolean;
  demo: boolean;
  connected: boolean;
  phase: Phase;
  startedAt: number | null;
  elapsed: number;
  samples: Measurement[];
  sessions: Session[];
  alerts: AlertItem[];
  thresholds: Thresholds;
  name: string;
  sport: string;
  kneeSide: "gauche" | "droite" | "les deux";
  weight: string;
  hydrate: () => Promise<void>;
  setProfile: (
    patch: Partial<Pick<State, "name" | "sport" | "kneeSide" | "weight">>,
  ) => void;
  setConnected: (v: boolean) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  tick: () => void;
  addSample: (m: Measurement) => void;
  finish: () => Promise<Session | null>;
  markRead: (id: string) => void;
  setThreshold: (key: keyof Thresholds, value: number) => void;
};
const persist = (s: State) =>
  AsyncStorage.setItem(
    KEY,
    JSON.stringify({
      sessions: s.sessions,
      alerts: s.alerts,
      thresholds: s.thresholds,
      name: s.name,
      sport: s.sport,
      kneeSide: s.kneeSide,
      weight: s.weight,
    }),
  ).catch(() => {});
export const useApp = create<State>((set, get) => ({
  hydrated: false,
  demo: false,
  connected: false,
  phase: "idle",
  startedAt: null,
  elapsed: 0,
  samples: [],
  sessions: [],
  alerts: [],
  thresholds: { flexion: 125, impact: 3, temperature: 38 },
  name: "Alex",
  sport: "Course à pied",
  kneeSide: "gauche",
  weight: "",
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const x = JSON.parse(raw);
        set({
          sessions: Array.isArray(x.sessions) ? x.sessions : [],
          alerts: Array.isArray(x.alerts) ? x.alerts : [],
          thresholds: x.thresholds ?? get().thresholds,
          name: x.name ?? "Alex",
          sport: x.sport ?? "Course à pied",
          kneeSide: x.kneeSide ?? "gauche",
          weight: x.weight ?? "",
        });
      }
    } catch {}
    set({ hydrated: true });
  },
  setProfile: (patch) => {
    set(patch);
    persist({ ...get(), ...patch });
  },
  setConnected: (v) => set({ connected: v, demo: v }),
  start: () => {
    const phase = get().phase;
    if (
      transitionPhase(phase, "start") === "running" &&
      (phase === "idle" || phase === "completed")
    )
      set({ phase: "running", startedAt: Date.now(), elapsed: 0, samples: [] });
  },
  pause: () => {
    if (transitionPhase(get().phase, "pause") === "paused")
      set({ phase: "paused" });
  },
  resume: () => {
    if (transitionPhase(get().phase, "resume") === "running")
      set({ phase: "running" });
  },
  tick: () =>
    set((s) => (s.phase === "running" ? { elapsed: s.elapsed + 1 } : {})),
  addSample: (m) => {
    const s = get();
    const samples = [...s.samples.slice(-119), m];
    const alerts = [...s.alerts];
    for (const breach of evaluateThresholds(m, s.thresholds))
      alerts.unshift({
        ...breach,
        id: `${m.timestamp}-${breach.category}`,
        timestamp: m.timestamp,
        read: false,
      });
    set({ samples, alerts: alerts.slice(0, 100) });
    persist({ ...s, samples, alerts });
  },
  finish: async () => {
    const s = get();
    if (!s.startedAt || !s.samples.length) {
      set({ phase: "idle", startedAt: null, elapsed: 0 });
      return null;
    }
    const session = summarizeSession(
      String(Date.now()),
      s.startedAt,
      Date.now(),
      s.elapsed,
      s.samples,
    );
    const sessions = [session, ...s.sessions];
    set({
      sessions,
      phase: transitionPhase(s.phase, "finish"),
      startedAt: null,
    });
    await persist({ ...s, sessions });
    return session;
  },
  markRead: (id) => {
    const alerts = get().alerts.map((a) =>
      a.id === id ? { ...a, read: true } : a,
    );
    set({ alerts });
    persist({ ...get(), alerts });
  },
  setThreshold: (key, value) => {
    const thresholds = { ...get().thresholds, [key]: value };
    set({ thresholds });
    persist({ ...get(), thresholds });
  },
}));
