import { AestheticFingerprint, AestheticImage } from '@/types';

/**
 * Calculate a user's aesthetic fingerprint based on their liked images
 */
export function calculateFingerprint(
  likedImageIds: string[],
  allImages: AestheticImage[]
): AestheticFingerprint {
  const likedImages = allImages.filter((img) => likedImageIds.includes(img.id));

  if (likedImages.length === 0) {
    return {
      dominantColors: [],
      topTags: [],
      categoryPreferences: {},
      colorHarmony: 'neutral',
      styleProfile: 'exploring',
    };
  }

  // Aggregate colors
  const colorMap: Record<string, number> = {};
  likedImages.forEach((img) => {
    img.colors.forEach((color) => {
      colorMap[color] = (colorMap[color] || 0) + 1;
    });
  });

  // Get top 5 colors
  const dominantColors = Object.entries(colorMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([color]) => color);

  // Aggregate tags
  const tagMap: Record<string, number> = {};
  likedImages.forEach((img) => {
    img.tags.forEach((tag) => {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    });
  });

  // Get top 5 tags
  const topTags = Object.entries(tagMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  // Category preferences
  const categoryPreferences: Record<string, number> = {};
  likedImages.forEach((img) => {
    categoryPreferences[img.category] = (categoryPreferences[img.category] || 0) + 1;
  });

  // Determine color harmony
  const colorHarmony = determineColorHarmony(dominantColors);

  // Determine style profile
  const styleProfile = determineStyleProfile(topTags);

  return {
    dominantColors,
    topTags,
    categoryPreferences,
    colorHarmony,
    styleProfile,
  };
}

function determineColorHarmony(colors: string[]): string {
  if (colors.length === 0) return 'neutral';

  // Simple heuristic based on color values
  const avgLightness = colors.reduce((sum, color) => {
    const lightness = getLightness(color);
    return sum + lightness;
  }, 0) / colors.length;

  if (avgLightness > 200) return 'light & airy';
  if (avgLightness < 100) return 'dark & moody';
  
  // Check for warm vs cool
  const warmCount = colors.filter((c) => isWarmColor(c)).length;
  if (warmCount > colors.length / 2) return 'warm';
  if (warmCount < colors.length / 2) return 'cool';

  return 'neutral';
}

function determineStyleProfile(tags: string[]): string {
  const profiles: Record<string, string[]> = {
    minimalist: ['minimalist', 'minimal', 'clean', 'modern', 'simple'],
    maximalist: ['bold', 'vibrant', 'eclectic', 'colorful', 'pattern'],
    natural: ['nature', 'organic', 'botanical', 'natural', 'green'],
    sophisticated: ['elegant', 'chic', 'sophisticated', 'luxury', 'refined'],
    bohemian: ['boho', 'eclectic', 'warm', 'cozy', 'earthy'],
  };

  const scores: Record<string, number> = {};
  Object.entries(profiles).forEach(([profile, keywords]) => {
    scores[profile] = tags.filter((tag) => keywords.includes(tag.toLowerCase())).length;
  });

  const topProfile = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return topProfile ? topProfile[0] : 'eclectic';
}

function getLightness(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return (r + g + b) / 3;
}

function isWarmColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return r > b; // Simple heuristic: warm colors have more red than blue
}

/**
 * Calculate match score between a product and user fingerprint
 */
export function calculateMatchScore(
  productTags: string[],
  productColors: string[],
  fingerprint: AestheticFingerprint
): number {
  let score = 0;

  // Tag matching (40% weight)
  const tagMatches = productTags.filter((tag) =>
    fingerprint.topTags.some((fpTag) => fpTag.toLowerCase() === tag.toLowerCase())
  ).length;
  score += (tagMatches / Math.max(productTags.length, 1)) * 40;

  // Color matching (40% weight)
  const colorMatches = productColors.filter((color) =>
    fingerprint.dominantColors.includes(color)
  ).length;
  score += (colorMatches / Math.max(productColors.length, 1)) * 40;

  // Style harmony (20% weight)
  const styleMatch = productTags.some((tag) =>
    tag.toLowerCase().includes(fingerprint.styleProfile.toLowerCase())
  );
  score += styleMatch ? 20 : 0;

  return Math.round(score);
}
