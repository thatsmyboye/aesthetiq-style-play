import type { Product } from "@/types";

export type AestheticTag = string;
export type ColorHex = string;

// --- TAG COSINE SIMILARITY (0..1)
export function tagCosine(aTags: AestheticTag[], bTags: AestheticTag[]): number {
  // Build binary vectors over union
  const set = Array.from(new Set([...aTags, ...bTags]));
  if (set.length === 0) return 0;
  const av = set.map(t => aTags.includes(t) ? 1 : 0);
  const bv = set.map(t => bTags.includes(t) ? 1 : 0);
  const dot = av.reduce((s, x, i) => s + x * bv[i], 0);
  const na = Math.sqrt(av.reduce((s, x) => s + x * x, 0));
  const nb = Math.sqrt(bv.reduce((s, x) => s + x * x, 0));
  return (na && nb) ? (dot / (na * nb)) : 0;
}

// --- PALETTE SIMILARITY (0..1) using best-hex match
type RGB = { r: number; g: number; b: number };
const hexToRgb = (h: ColorHex): RGB => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });
const rgbDist = (a: RGB, b: RGB) => Math.hypot(a.r-b.r, a.g-b.g, a.b-b.b); // 0..441
export function paletteSimilarity(a: ColorHex[], b: ColorHex[]): number {
  if (!a?.length || !b?.length) return 0;
  let best = 0;
  for (const ah of a) {
    const ar = hexToRgb(ah);
    let local = 0;
    for (const bh of b) {
      const br = hexToRgb(bh);
      const sim = 1 - (rgbDist(ar, br) / 441);
      if (sim > local) local = sim;
    }
    if (local > best) best = local;
  }
  return best; // 0..1
}

// --- COMPOSITE PRODUCT-TO-PRODUCT SIMILARITY (0..1)
export function productSimilarity(a: Product, b: Product): number {
  const tagSim = tagCosine(a.tags as AestheticTag[], b.tags as AestheticTag[]);          // structure
  const palSim = paletteSimilarity(a.colors as ColorHex[], b.colors as ColorHex[]); // color
  // Optional small nudge for same brand
  const brandSim = a.brand === b.brand ? 0.1 : 0;
  // Weighted blend
  return 0.6 * tagSim + 0.35 * palSim + brandSim;
}
