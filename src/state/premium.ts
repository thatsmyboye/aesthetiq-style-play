const KEY = "aesthetiq.premium.v1";
const METER_KEY = "aesthetiq.meters.v1";

export type Entitlement = {
  active: boolean;
  since?: number;
  source?: "mock" | "stripe" | "code";
};

export function loadEntitlement(): Entitlement {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return { active:false }; }
}
export function saveEntitlement(e: Entitlement) {
  try { localStorage.setItem(KEY, JSON.stringify(e)); } catch {}
}

type Meters = { whyOpens: number; deepMatchesViews: number; wrappedExports: number; };
export function loadMeters(): Meters {
  try { 
    const stored = localStorage.getItem(METER_KEY);
    if (!stored) return { whyOpens: 0, deepMatchesViews: 0, wrappedExports: 0 };
    return JSON.parse(stored); 
  } catch { 
    return { whyOpens: 0, deepMatchesViews: 0, wrappedExports: 0 }; 
  }
}
export function bumpMeter(k: keyof Meters) {
  const m = loadMeters();
  m[k] = (m[k] || 0) + 1;
  try { localStorage.setItem(METER_KEY, JSON.stringify(m)); } catch {}
  return m;
}
export function getMeter(k: keyof Meters) {
  const m = loadMeters(); 
  return m[k] || 0;
}
export function resetMeters() {
  try { localStorage.removeItem(METER_KEY); } catch {}
}

// Legacy zustand hook compatibility (used by Shop page)
export function usePremium() {
  const ent = loadEntitlement();
  return {
    isPremium: ent.active,
    enablePremium: () => saveEntitlement({ active: true, since: Date.now(), source: "mock" }),
    disablePremium: () => saveEntitlement({ active: false }),
    togglePremium: () => {
      const current = loadEntitlement();
      saveEntitlement({ active: !current.active, since: Date.now(), source: "mock" });
    }
  };
}
