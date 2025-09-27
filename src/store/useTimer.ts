import {create} from 'zustand';

type TimerState = {
  isRunning: boolean;
  startEpochMs: number;
  offsetMs: number;
  elapsedMs: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  seekTo: (ms: number) => void;
  tick: (nowMs: number) => void;
};

export const useTimer = create<TimerState>((set, get) => ({
  isRunning: false,
  startEpochMs: 0,
  offsetMs: 0,
  elapsedMs: 0,
  start: () => {
    const {isRunning, offsetMs} = get();
    if (isRunning) return;
    const now = (global as any).performance?.now?.() ?? Date.now();
    set({ isRunning: true, startEpochMs: now - offsetMs });
  },
  pause: () => {
    const {isRunning, elapsedMs} = get();
    if (!isRunning) return;
    set({ isRunning: false, offsetMs: elapsedMs });
  },
  reset: () => set({ isRunning: false, startEpochMs: 0, offsetMs: 0, elapsedMs: 0 }),
  seekTo: (ms) => {
    const {isRunning} = get();
    const now = (global as any).performance?.now?.() ?? Date.now();
    set({
      offsetMs: ms,
      startEpochMs: isRunning ? now - ms : 0,
      elapsedMs: ms,
    });
  },
  tick: (nowMs) => {
    const {isRunning, startEpochMs, offsetMs} = get();
    if (!isRunning) return set({ elapsedMs: offsetMs });
    set({ elapsedMs: Math.max(0, nowMs - startEpochMs) });
  },
}));
