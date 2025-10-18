import { AestheticFingerprint } from '@/types';
import { AestheticTag, ColorHex } from '@/types/domain';
import { TAG_LABELS } from './vibeLabels';
import { rgbDistance } from './colorDistance';

export interface MatchReason {
  type: 'tag' | 'color';
  score: number;
  details: string;
}

/**
 * Calculate detailed match reasons for a product
 */
export function calculateMatchReasons(
  productTags: string[],
  productColors: string[],
  fingerprint: AestheticFingerprint
): MatchReason[] {
  const reasons: MatchReason[] = [];

  // Tag matches
  const matchingTags = productTags.filter((tag) =>
    fingerprint.topTags.includes(tag)
  );

  if (matchingTags.length > 0) {
    const tagScore = (matchingTags.length / fingerprint.topTags.length) * 100;
    reasons.push({
      type: 'tag',
      score: Math.round(tagScore),
      details: `Matches your ${matchingTags
        .slice(0, 3)
        .map((tag) => TAG_LABELS[tag as AestheticTag] || tag)
        .join(', ')} aesthetic`,
    });
  }

  // Color harmony
  if (productColors.length > 0 && fingerprint.dominantColors.length > 0) {
    let totalDistance = 0;
    let comparisons = 0;

    for (const productColor of productColors.slice(0, 3)) {
      for (const userColor of fingerprint.dominantColors.slice(0, 3)) {
        totalDistance += rgbDistance(productColor as ColorHex, userColor as ColorHex);
        comparisons++;
      }
    }

    if (comparisons > 0) {
      const avgDistance = totalDistance / comparisons;
      // rgbDistance returns 0..1, convert to 0-100 score (smaller distance = higher score)
      const colorScore = Math.max(0, (1 - avgDistance) * 100);

      if (colorScore > 50) {
        reasons.push({
          type: 'color',
          score: Math.round(colorScore),
          details: `Color palette aligns with your preferences`,
        });
      }
    }
  }

  return reasons.sort((a, b) => b.score - a.score);
}

/**
 * Get a human-readable summary of match reasons
 */
export function getMatchSummary(reasons: MatchReason[]): string {
  if (reasons.length === 0) return 'Similar to your aesthetic';

  const topReason = reasons[0];
  if (reasons.length === 1) {
    return topReason.details;
  }

  return `${topReason.details} • ${reasons.length - 1} more match${
    reasons.length > 2 ? 'es' : ''
  }`;
}
