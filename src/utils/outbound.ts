import { AFFILIATE_MODE, AFF_SOURCE, PARTNER_AFF_PARAM, UTM } from "@/config/aff";
import { getClickId } from "@/state/aff";

export function buildProductUrl({
  baseUrl,
  brandId,
  deckId,
  affParamKey,
  affParamValue,
}: {
  baseUrl: string;
  brandId?: string;
  deckId?: string | null;
  affParamKey?: string;
  affParamValue?: string;
}) {
  try {
    const u = new URL(baseUrl);
    if (AFFILIATE_MODE) {
      // Use custom aff params if provided, otherwise use defaults
      if (affParamKey && affParamValue) {
        u.searchParams.set(affParamKey, affParamValue);
      } else if (brandId) {
        u.searchParams.set(PARTNER_AFF_PARAM, brandId);
      }
      
      u.searchParams.set("src", AFF_SOURCE);
      const cid = getClickId();
      if (cid) u.searchParams.set("click_id", cid);
      if (deckId) u.searchParams.set("deck", deckId);
      
      // UTM trio
      u.searchParams.set("utm_source", UTM.source);
      u.searchParams.set("utm_medium", UTM.medium);
      u.searchParams.set("utm_campaign", UTM.campaign);
    }
    return u.toString();
  } catch {
    // if baseUrl is relative or invalid, just append naïvely
    const s = new URLSearchParams();
    if (AFFILIATE_MODE) {
      if (affParamKey && affParamValue) {
        s.set(affParamKey, affParamValue);
      } else if (brandId) {
        s.set(PARTNER_AFF_PARAM, brandId);
      }
      const cid = getClickId();
      if (cid) s.set("click_id", cid);
      s.set("src", AFF_SOURCE);
      s.set("utm_source", UTM.source);
      s.set("utm_medium", UTM.medium);
      s.set("utm_campaign", UTM.campaign);
      if (deckId) s.set("deck", deckId);
    }
    return baseUrl + (baseUrl.includes("?") ? "&" : "?") + s.toString();
  }
}
