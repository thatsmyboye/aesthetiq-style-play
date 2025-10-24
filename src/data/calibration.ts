import type { VisualItem } from '@/types/domain';

/**
 * Calibration pairs: curated contrasts to quickly establish initial taste vector
 * New users see these 5 pairs before entering the main randomized deck
 */
export const calibrationPairs: [VisualItem, VisualItem][] = [
  // Pair 1: Minimal vs Maximal
  [
    {
      id: 'cal-minimal',
      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop',
      source: 'Unsplash',
      tags: ['minimal', 'soft_light', 'neutral_palette'],
      palette: ['#FFFFFF', '#F5F5F5', '#E8E8E8'],
    },
    {
      id: 'cal-maximal',
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop',
      source: 'Unsplash',
      tags: ['maximal', 'boldcolor', 'curved'],
      palette: ['#E8C4B8', '#C89F94', '#D4A29B'],
    },
  ],

  // Pair 2: Coastal vs Brutalist
  [
    {
      id: 'cal-coastal',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop',
      source: 'Unsplash',
      tags: ['coastal', 'organic', 'neutral_palette', 'soft_light'],
      palette: ['#E8DCC8', '#C9B8A3', '#A8B2B8'],
    },
    {
      id: 'cal-brutalist',
      url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&auto=format&fit=crop',
      source: 'Unsplash',
      tags: ['brutalist', 'angular', 'metallic', 'high_contrast'],
      palette: ['#2C3E50', '#95A5A6', '#34495E'],
    },
  ],

  // Pair 3: Vintage vs Glasscore
  [
    {
      id: 'cal-vintage',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
      source: 'Unsplash',
      tags: ['vintage', 'natural_fiber', 'neutral_palette'],
      palette: ['#D5C7BC', '#B8A89A', '#9B8B7E'],
    },
    {
      id: 'cal-glasscore',
      url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop',
      source: 'Unsplash',
      tags: ['glasscore', 'soft_light', 'minimal', 'curved'],
      palette: ['#E8F4F8', '#C8D8E8', '#F0F8FF'],
    },
  ],

  // Pair 4: Organic vs Industrial
  [
    {
      id: 'cal-organic',
      url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop',
      source: 'Unsplash',
      tags: ['organic', 'natural_fiber', 'neutral_palette', 'soft_light'],
      palette: ['#8BA888', '#6B8E6F', '#A4C2A0'],
    },
    {
      id: 'cal-industrial',
      url: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&auto=format&fit=crop',
      source: 'Unsplash',
      tags: ['industrial', 'angular', 'high_contrast', 'metallic'],
      palette: ['#3E4E5E', '#6B7C8C', '#2C3A4A'],
    },
  ],

  // Pair 5: Pastel/Coquette vs Bold Color
  [
    {
      id: 'cal-pastel',
      url: 'https://images.unsplash.com/photo-1595399874451-7843a0e8ea3d?w=800&auto=format&fit=crop',
      source: 'Unsplash',
      tags: ['coquette', 'pastel', 'soft_light', 'curved'],
      palette: ['#F8E8E8', '#E8D8D8', '#F5E6E6'],
    },
    {
      id: 'cal-boldcolor',
      url: 'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=800&auto=format&fit=crop',
      source: 'Unsplash',
      tags: ['midcentury', 'curved', 'natural_fiber', 'boldcolor'],
      palette: ['#C17767', '#E8A598', '#D4886C'],
    },
  ],
];
