import { AestheticFingerprint } from '@/types';
import { TAG_LABELS } from './vibeLabels';
import { AestheticTag } from '@/types/domain';

export interface SimpleMatchReason {
  type: 'tag' | 'color';
  score: number;
  details: string;
}

/**
 * Generate simple match reasons for Shop page (works with AestheticFingerprint)
 */
export function generateMatchReasons(
  productTags: string[],
  productColors: string[],
  fingerprint: AestheticFingerprint
): SimpleMatchReason[] {
  const reasons: SimpleMatchReason[] = [];

  // Tag matches
  const matchingTags = productTags.filter((tag) =>
    fingerprint.topTags.some((fpTag) => fpTag.toLowerCase() === tag.toLowerCase())
  );

  if (matchingTags.length > 0 && fingerprint.topTags.length > 0) {
    const tagScore = (matchingTags.length / fingerprint.topTags.length) * 100;
    const displayTags = matchingTags
      .slice(0, 3)
      .map((tag) => TAG_LABELS[tag as AestheticTag] || tag)
      .join(', ');
    
    reasons.push({
      type: 'tag',
      score: Math.round(tagScore),
      details: `Matches your ${displayTags} aesthetic`,
    });
  }

  // Color harmony
  const matchingColors = productColors.filter((color) =>
    fingerprint.dominantColors.includes(color)
  );

  if (matchingColors.length > 0 && fingerprint.dominantColors.length > 0) {
    const colorScore = (matchingColors.length / fingerprint.dominantColors.length) * 100;
    
    reasons.push({
      type: 'color',
      score: Math.round(colorScore),
      details: `Color palette aligns with your preferences`,
    });
  }

  return reasons.sort((a, b) => b.score - a.score);
}
