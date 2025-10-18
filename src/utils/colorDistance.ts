import { ColorHex } from '@/types/domain';

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
 * Returns 0..1 (normalized by max possible distance)
 */
export function rgbDistance(hex1: ColorHex, hex2: ColorHex): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
  );

  // Max possible distance is sqrt(255^2 * 3) ≈ 441.67
  return distance / 441.67;
}

/**
 * Calculate minimum distance from a color to a palette
 * Returns 0..1 (0 = perfect match, 1 = maximum distance)
 */
export function minDistanceToPalette(color: ColorHex, palette: ColorHex[]): number {
  if (palette.length === 0) return 1;

  let minDist = 1;
  for (const paletteColor of palette) {
    const dist = rgbDistance(color, paletteColor);
    if (dist < minDist) {
      minDist = dist;
    }
  }
  return minDist;
}

/**
 * Calculate palette harmony score (0..1)
 * Higher score = better harmony with user's palette
 */
export function calculatePaletteHarmony(
  productPalette: ColorHex[],
  userPalette: ColorHex[]
): number {
  if (userPalette.length === 0 || productPalette.length === 0) return 0.5;

  // Average minimum distance from each product color to user palette
  const distances = productPalette.map((color) => minDistanceToPalette(color, userPalette));
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  // Convert distance to harmony (invert and normalize)
  return 1 - avgDistance;
}
