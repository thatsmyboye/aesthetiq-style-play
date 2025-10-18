import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AestheticVector, VisualItem, Product, AestheticTag } from '@/types/domain';
import { calculatePaletteHarmony } from '@/utils/colorDistance';

// Constants for weight updates
const CHOSEN_WEIGHT_DELTA = 0.05;
const REJECTED_WEIGHT_DELTA = 0.02;
const TARGET_CHOICES = 60;
const MAX_PALETTE_SIZE = 24;

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
  // Clone previous tags
  const newTags = { ...prev.tags };

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
 * Calculate composite product score
 */
export function scoreProduct(product: Product, vector: AestheticVector): number {
  // If no choices yet, return neutral score
  if (vector.choices === 0) return 0.5;

  const tagScore = calculateTagAlignment(product.tags, vector);
  const paletteScore = calculatePaletteHarmony(product.palette, vector.palette);

  // Weighted combination: 70% tags, 30% palette
  return 0.7 * tagScore + 0.3 * paletteScore;
}

/**
 * Rank products by score (descending)
 */
export function rankProducts(products: Product[], vector: AestheticVector): Product[] {
  return products
    .map((product) => ({
      ...product,
      _score: scoreProduct(product, vector),
    }))
    .sort((a, b) => b._score - a._score);
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
