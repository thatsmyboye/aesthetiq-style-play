import type { AestheticTag } from "@/types/domain";
import { explainScore } from "@/state/taste";
import type { AestheticVector } from "@/types/domain";

const LABELS: Record<AestheticTag, string> = {
  minimal: "Minimal",
  maximal: "Maximal",
  midcentury: "Mid-century",
  brutalist: "Brutalist",
  coquette: "Coquette",
  vintage: "Vintage",
  industrial: "Industrial",
  organic: "Organic",
  glasscore: "Glasscore",
  coastal: "Coastal",
  pastel: "Pastel",
  monochrome: "Monochrome",
  boldcolor: "Bold color",
  natural_fiber: "Natural fiber",
  metallic: "Metallic",
  curved: "Curved",
  angular: "Angular",
  soft_light: "Soft light",
  high_contrast: "High contrast",
  neutral_palette: "Neutral palette",
};

interface ProductLike {
  tags: AestheticTag[];
  colors: string[];
  brand: string;
}

export function getMatchReasons(p: ProductLike, v: AestheticVector, recentBrands: string[] = []) {
  const e = explainScore(
    { 
      id: '', 
      title: '', 
      image: '', 
      price: 0, 
      currency: 'USD', 
      url: '', 
      brand: p.brand, 
      tags: p.tags, 
      palette: p.colors as any 
    }, 
    v, 
    recentBrands
  );
  
  // Top tags by weight contribution
  const topTags = [...e.tagScoreBreakdown]
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 3) as [AestheticTag, number][];

  const tagsPretty = topTags.map(([t]) => LABELS[t]);
  const palettePct = Math.round(e.paletteScore * 100); // 0..100

  return { tagsPretty, palettePct, details: e };
}
