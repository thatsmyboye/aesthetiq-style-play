import { ColorHex } from '@/types/domain';
import { hexToRgb, rgbDistance } from './colorDistance';

/**
 * Deduplicate similar colors from a palette
 */
export function deduplicateColors(
  colors: ColorHex[],
  threshold: number = 30
): ColorHex[] {
  if (colors.length === 0) return [];

  const unique: ColorHex[] = [colors[0]];

  for (let i = 1; i < colors.length; i++) {
    const color = colors[i];

    // Check if this color is too similar to any existing unique color
    const isSimilar = unique.some((existingColor) => {
      const distance = rgbDistance(color, existingColor);
      // rgbDistance returns 0..1, threshold is in RGB space (0-255)
      // Convert threshold to normalized space
      return distance < threshold / 441.67;
    });

    if (!isSimilar) {
      unique.push(color);
    }
  }

  return unique;
}

/**
 * Get most frequent colors from palette
 */
export function getFrequentColors(
  palette: ColorHex[],
  count: number = 12
): ColorHex[] {
  // Count occurrences
  const colorCounts = new Map<ColorHex, number>();
  palette.forEach((color) => {
    colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
  });

  // Sort by frequency and deduplicate similar colors
  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color);

  const deduplicated = deduplicateColors(sortedColors);
  return deduplicated.slice(0, count);
}
