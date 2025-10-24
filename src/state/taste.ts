import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AestheticVector, VisualItem, Product, AestheticTag, ColorHex } from '@/types/domain';

// Constants for weight updates
const CHOSEN_WEIGHT_DELTA = 0.05;
const REJECTED_WEIGHT_DELTA = 0.02;
const TAG_DECAY_FACTOR = 0.999; // Smooth decay to prevent runaway dominance
const BRAND_AFFINITY_BUMP = 0.03; // Bonus for familiar brands
const TARGET_CHOICES = 60;
const MAX_PALETTE_SIZE = 24;

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: ColorHex): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Calculate Euclidean distance between two RGB colors
 * Returns value in range 0..441 (max possible distance)
 */
export function rgbDistanceRaw(hex1: ColorHex, hex2: ColorHex): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
  );
}

/**
 * Calculate normalized color distance (0..1)
 * 1 = perfect match, 0 = maximum distance
 */
export function normalizedColorSimilarity(hex1: ColorHex, hex2: ColorHex): number {
  const distance = rgbDistanceRaw(hex1, hex2);
  // Max distance is sqrt(255^2 * 3) ≈ 441
  return 1 - (distance / 441);
}

/**
 * Create initial empty aesthetic vector
 */
export function getInitialVector(): AestheticVector {
  const tags: Record<AestheticTag, number> = {
    minimal: 0,
    maximal: 0,
    midcentury: 0,
    brutalist: 0,
    coquette: 0,
    vintage: 0,
    industrial: 0,
    organic: 0,
    glasscore: 0,
    coastal: 0,
    pastel: 0,
    monochrome: 0,
    boldcolor: 0,
    natural_fiber: 0,
    metallic: 0,
    curved: 0,
    angular: 0,
    soft_light: 0,
    high_contrast: 0,
    neutral_palette: 0,
  };

  return {
    tags,
    palette: [],
    confidence: 0,
    choices: 0,
  };
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Update aesthetic vector based on user choice
 */
export function updateVectorOnChoice(
  chosen: VisualItem,
  rejected: VisualItem,
  prev: AestheticVector
): AestheticVector {
  // Clone previous tags and apply decay to all weights
  const newTags = { ...prev.tags };
  
  // Apply tiny decay to all tags to prevent runaway dominance
  (Object.keys(newTags) as AestheticTag[]).forEach((tag) => {
    newTags[tag] = clamp(newTags[tag] * TAG_DECAY_FACTOR, -1, 1);
  });

  // Increase weights for chosen tags
  chosen.tags.forEach((tag) => {
    newTags[tag] = clamp(newTags[tag] + CHOSEN_WEIGHT_DELTA, -1, 1);
  });

  // Decrease weights for rejected tags (only if not in chosen)
  rejected.tags.forEach((tag) => {
    if (!chosen.tags.includes(tag)) {
      newTags[tag] = clamp(newTags[tag] - REJECTED_WEIGHT_DELTA, -1, 1);
    }
  });

  // Update palette: append chosen colors and keep last MAX_PALETTE_SIZE
  const newPalette = [...prev.palette, ...chosen.palette].slice(-MAX_PALETTE_SIZE);

  // Increment choices and calculate confidence
  const newChoices = prev.choices + 1;
  const newConfidence = Math.min(1, newChoices / TARGET_CHOICES);

  return {
    tags: newTags,
    palette: newPalette,
    confidence: newConfidence,
    choices: newChoices,
  };
}

/**
 * Calculate tag alignment score (0..1)
 */
function calculateTagAlignment(productTags: AestheticTag[], vector: AestheticVector): number {
  if (productTags.length === 0) return 0;

  const weights = productTags.map((tag) => vector.tags[tag]);
  const sum = weights.reduce((acc, w) => acc + w, 0);
  const mean = sum / weights.length;

  // Normalize from [-1..1] to [0..1]
  return (mean + 1) / 2;
}

/**
 * Calculate palette harmony using RGB distance (0..1)
 */
function calculatePaletteHarmonyRGB(
  productPalette: ColorHex[],
  userPalette: ColorHex[]
): number {
  if (userPalette.length === 0 || productPalette.length === 0) return 0.5;

  // Average best similarity for each product color to user palette
  const similarities = productPalette.map((pColor) => {
    const bestMatch = Math.max(
      ...userPalette.map((uColor) => normalizedColorSimilarity(pColor, uColor))
    );
    return bestMatch;
  });

  return similarities.reduce((sum, s) => sum + s, 0) / similarities.length;
}

/**
 * Check if brand appears in user's recent favorites (last 8)
 */
export function getBrandAffinity(productBrand: string, recentFavoriteBrands: string[]): number {
  const normalizedBrand = productBrand.toLowerCase().trim();
  const hasFamiliarity = recentFavoriteBrands.some(
    (fav) => fav.toLowerCase().trim() === normalizedBrand
  );
  return hasFamiliarity ? BRAND_AFFINITY_BUMP : 0;
}

/**
 * Calculate composite product score with optional brand affinity
 */
export function scoreProduct(
  product: Product,
  vector: AestheticVector,
  recentFavoriteBrands: string[] = []
): number {
  // If no choices yet, return neutral score
  if (vector.choices === 0) return 0.5;

  const tagScore = calculateTagAlignment(product.tags, vector);
  const paletteScore = calculatePaletteHarmonyRGB(product.palette, vector.palette);
  const brandAffinity = getBrandAffinity(product.brand, recentFavoriteBrands);

  // Weighted combination: 70% tags, 30% palette + brand bump
  return 0.7 * tagScore + 0.3 * paletteScore + brandAffinity;
}

/**
 * Detailed score explanation for Premium users
 */
export interface ScoreExplanation {
  tagScoreBreakdown: Array<[AestheticTag, number]>;
  paletteScore: number;
  brandAffinity: number;
  final: number;
}

export function explainScore(
  product: Product,
  vector: AestheticVector,
  recentFavoriteBrands: string[] = []
): ScoreExplanation {
  if (vector.choices === 0) {
    return {
      tagScoreBreakdown: [],
      paletteScore: 0.5,
      brandAffinity: 0,
      final: 0.5,
    };
  }

  // Tag breakdown: show each tag's contribution
  const tagScoreBreakdown: Array<[AestheticTag, number]> = product.tags.map((tag) => [
    tag,
    vector.tags[tag],
  ]);

  const paletteScore = calculatePaletteHarmonyRGB(product.palette, vector.palette);
  const brandAffinity = getBrandAffinity(product.brand, recentFavoriteBrands);
  const tagScore = calculateTagAlignment(product.tags, vector);
  const final = 0.7 * tagScore + 0.3 * paletteScore + brandAffinity;

  return {
    tagScoreBreakdown,
    paletteScore,
    brandAffinity,
    final,
  };
}

/**
 * Rank products by score (descending) with conflict breaker
 */
export function rankProducts(
  products: Product[],
  vector: AestheticVector,
  recentFavoriteBrands: string[] = []
): Product[] {
  return products
    .map((product) => ({
      ...product,
      _score: scoreProduct(product, vector, recentFavoriteBrands),
    }))
    .sort((a, b) => {
      // If scores are very close (within 0.001), use brand affinity as tiebreaker
      if (Math.abs(b._score - a._score) < 0.001) {
        const aAffinity = getBrandAffinity(a.brand, recentFavoriteBrands);
        const bAffinity = getBrandAffinity(b.brand, recentFavoriteBrands);
        return bAffinity - aAffinity;
      }
      return b._score - a._score;
    });
}

/**
 * Check if user should go through calibration
 */
export function shouldCalibrate(): boolean {
  const done = localStorage.getItem('aesthetiq.calibration_done');
  return !done;
}

/**
 * Mark calibration as complete
 */
export function markCalibrationDone(): void {
  localStorage.setItem('aesthetiq.calibration_done', 'true');
}

/**
 * Reset calibration flag (useful for testing or reset)
 */
export function resetCalibration(): void {
  localStorage.removeItem('aesthetiq.calibration_done');
}

// Zustand store interface
interface TasteStore {
  vector: AestheticVector;
  choose: (chosen: VisualItem, rejected: VisualItem) => void;
  reset: () => void;
}

/**
 * Zustand store with localStorage persistence
 */
export const useTasteStore = create<TasteStore>()(
  persist(
    (set) => ({
      vector: getInitialVector(),

      choose: (chosen: VisualItem, rejected: VisualItem) => {
        set((state) => ({
          vector: updateVectorOnChoice(chosen, rejected, state.vector),
        }));
      },

      reset: () => {
        set({ vector: getInitialVector() });
      },
    }),
    {
      name: 'aesthetiq-taste-vector',
    }
  )
);
