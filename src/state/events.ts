type E = {
  event: string;
  ts: number;
  payload: Record<string, any>;
};

const KEY = "aesthetiq.events.v1";

export function logEvent(event: string, payload: Record<string, any> = {}) {
  const rec: E = { event, ts: Date.now(), payload };
  try {
    const raw = localStorage.getItem(KEY);
    const arr: E[] = raw ? JSON.parse(raw) : [];
    arr.push(rec);
    // Keep last 500 events
    const trimmed = arr.slice(-500);
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {}
  
  try {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ event, ...payload });
  } catch {}
}

export function getEvents(): E[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearEvents() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

