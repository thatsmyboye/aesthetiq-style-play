import { AestheticTag } from '@/types/domain';

// Friendly tag names
export const TAG_LABELS: Record<AestheticTag, string> = {
  minimal: 'Minimal',
  maximal: 'Maximal',
  midcentury: 'Mid-Century',
  brutalist: 'Brutalist',
  coquette: 'Coquette',
  vintage: 'Vintage',
  industrial: 'Industrial',
  organic: 'Organic',
  glasscore: 'Glasscore',
  coastal: 'Coastal',
  pastel: 'Pastel',
  monochrome: 'Monochrome',
  boldcolor: 'Bold Color',
  natural_fiber: 'Natural Fiber',
  metallic: 'Metallic',
  curved: 'Curved',
  angular: 'Angular',
  soft_light: 'Soft Light',
  high_contrast: 'High Contrast',
  neutral_palette: 'Neutral Palette',
};

// Vibe combination rules
const VIBE_RULES: Array<{
  tags: AestheticTag[];
  label: string;
}> = [
  { tags: ['coastal', 'glasscore', 'soft_light'], label: 'Coastal Futurism' },
  { tags: ['coastal', 'glasscore', 'neutral_palette'], label: 'Coastal Futurism' },
  { tags: ['coastal', 'organic', 'neutral_palette'], label: 'Coastal Serenity' },
  { tags: ['coastal', 'minimal', 'soft_light'], label: 'Coastal Minimalism' },
  { tags: ['minimal', 'monochrome', 'angular'], label: 'Modern Minimalism' },
  { tags: ['minimal', 'soft_light', 'neutral_palette'], label: 'Soft Minimalism' },
  { tags: ['brutalist', 'angular', 'monochrome'], label: 'Neo-Brutalism' },
  { tags: ['brutalist', 'industrial', 'metallic'], label: 'Industrial Brutalism' },
  { tags: ['brutalist', 'high_contrast'], label: 'Bold Brutalism' },
  { tags: ['maximal', 'boldcolor', 'curved'], label: 'Vibrant Maximalism' },
  { tags: ['maximal', 'coquette', 'pastel'], label: 'Romantic Maximalism' },
  { tags: ['maximal', 'vintage'], label: 'Vintage Maximalism' },
  { tags: ['midcentury', 'curved', 'natural_fiber'], label: 'Classic Mid-Century' },
  { tags: ['midcentury', 'boldcolor'], label: 'Vibrant Mid-Century' },
  { tags: ['vintage', 'organic', 'natural_fiber'], label: 'Organic Vintage' },
  { tags: ['vintage', 'neutral_palette'], label: 'Timeless Vintage' },
  { tags: ['industrial', 'metallic', 'angular'], label: 'Modern Industrial' },
  { tags: ['industrial', 'high_contrast'], label: 'Bold Industrial' },
  { tags: ['coquette', 'pastel', 'soft_light'], label: 'Soft Coquette' },
  { tags: ['coquette', 'curved'], label: 'Romantic Coquette' },
  { tags: ['organic', 'natural_fiber', 'neutral_palette'], label: 'Natural Organic' },
  { tags: ['organic', 'coastal'], label: 'Coastal Organic' },
  { tags: ['glasscore', 'minimal', 'soft_light'], label: 'Ethereal Minimalism' },
  { tags: ['pastel', 'soft_light'], label: 'Soft Pastel Dream' },
  { tags: ['monochrome', 'high_contrast'], label: 'Bold Monochrome' },
];

/**
 * Get top N tags by weight (absolute value)
 */
export function getTopTags(
  tagWeights: Record<AestheticTag, number>,
  count: number = 8
): Array<{ tag: AestheticTag; weight: number; label: string }> {
  return Object.entries(tagWeights)
    .map(([tag, weight]) => ({
      tag: tag as AestheticTag,
      weight: Math.abs(weight),
      label: TAG_LABELS[tag as AestheticTag],
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count);
}

/**
 * Generate 2-3 composite vibe labels based on top tags
 */
export function generateVibeLabels(
  tagWeights: Record<AestheticTag, number>
): string[] {
  // Get top 5 tags with positive weights
  const topTags = Object.entries(tagWeights)
    .filter(([_, weight]) => weight > 0.1)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag as AestheticTag);

  const vibes: string[] = [];

  // Try to match vibe rules
  for (const rule of VIBE_RULES) {
    const matches = rule.tags.filter((tag) => topTags.includes(tag));
    if (matches.length >= 2) {
      vibes.push(rule.label);
      if (vibes.length >= 3) break;
    }
  }

  // If we don't have enough vibes, add individual top tags as labels
  if (vibes.length < 2) {
    const additionalLabels = topTags
      .slice(0, 3 - vibes.length)
      .map((tag) => TAG_LABELS[tag]);
    vibes.push(...additionalLabels);
  }

  return vibes.slice(0, 3);
}
