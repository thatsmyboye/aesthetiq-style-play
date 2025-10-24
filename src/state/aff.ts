const KEY = "aesthetiq.click_id";
const TS  = "aesthetiq.click_id_ts";

function makeId() {
  // short, URL-safe
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6);
}

export function getOrCreateClickId(ttlDays = 7) {
  try {
    const now = Date.now();
    const prev = localStorage.getItem(KEY);
    const ts = parseInt(localStorage.getItem(TS) || "0", 10);
    const ttl = ttlDays * 24 * 60 * 60 * 1000;
    if (prev && ts && now - ts < ttl) return prev;
    const id = makeId();
    localStorage.setItem(KEY, id);
    localStorage.setItem(TS, String(now));
    return id;
  } catch {
    // storage blocked—fallback to ephemeral id
    return makeId();
  }
}

export function getClickId(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
