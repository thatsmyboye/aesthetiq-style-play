import { CMP_STORAGE_KEY, PRIVACY_VERSION } from "@/config/privacy";

export type Consent = {
  v: number;                // version
  givenAt: number;          // ts
  // toggles:
  necessary: true;          // always true (required for core app)
  analytics: boolean;       // UI events, Wrapped opens, etc.
  affiliate: boolean;       // appending click_id/utm/aff params to outbound links
};

const DEFAULT: Consent = {
  v: PRIVACY_VERSION,
  givenAt: 0,
  necessary: true,
  analytics: false,
  affiliate: true, // default ON; can be toggled off by user
};

export function loadConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CMP_STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    // If version changed, re-prompt
    if (!c || c.v !== PRIVACY_VERSION) return null;
    return c;
  } catch { return null; }
}

export function saveConsent(c: Consent) {
  try { localStorage.setItem(CMP_STORAGE_KEY, JSON.stringify(c)); } catch {}
}

export function ensureConsent(): Consent {
  return loadConsent() || DEFAULT;
}
