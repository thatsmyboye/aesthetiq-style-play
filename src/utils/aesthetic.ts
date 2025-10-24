import type { AestheticTag } from '@/types/domain';

export const OPPOSITES: Partial<Record<AestheticTag, AestheticTag>> = {
  minimal: 'maximal',
  maximal: 'minimal',
  coastal: 'brutalist',
  brutalist: 'coastal',
  vintage: 'glasscore',
  glasscore: 'vintage',
  organic: 'industrial',
  industrial: 'organic',
  pastel: 'boldcolor',
  boldcolor: 'pastel',
  curved: 'angular',
  angular: 'curved',
  soft_light: 'high_contrast',
  high_contrast: 'soft_light',
  // neutrals & materials get looser negatives:
  neutral_palette: 'boldcolor',
  natural_fiber: 'metallic',
  metallic: 'natural_fiber',
  monochrome: 'boldcolor',
  midcentury: 'industrial', // heuristic
};

export function uncertaintyScore(weight: number, exposures: number) {
  // higher when |weight| ~ 0 and exposures are low
  const conf = Math.abs(weight); // 0..1 (0 = unsure)
  const scarcity = 1 / Math.sqrt(1 + exposures); // decays with more views
  return (1 - conf) * scarcity; // 0..1
}
