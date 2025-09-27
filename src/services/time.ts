export const nowMs = () => (global as any).performance?.now?.() ?? Date.now();

export function startTicker(cb: (t: number)=>void, fps = 10) {
  const interval = Math.max(1, Math.floor(1000 / fps));
  const id = setInterval(() => cb(nowMs()), interval);
  return () => clearInterval(id);
}
