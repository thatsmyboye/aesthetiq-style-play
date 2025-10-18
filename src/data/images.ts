import { VisualItem, AestheticTag, ColorHex } from '@/types/domain';

interface AdminImage {
  id: string;
  url: string;
  tags: string[];
  colors: string[];
  source?: string;
}

export const visualItems: VisualItem[] = [
  {
    id: 'vis-001',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['minimal', 'soft_light', 'neutral_palette'],
    palette: ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#D4D4D4'],
  },
  {
    id: 'vis-002',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['coastal', 'organic', 'neutral_palette', 'soft_light'],
    palette: ['#E8DCC8', '#C9B8A3', '#A8B2B8', '#F5F0E8'],
  },
  {
    id: 'vis-003',
    url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['brutalist', 'angular', 'metallic', 'high_contrast'],
    palette: ['#2C3E50', '#95A5A6', '#34495E', '#7F8C8D'],
  },
  {
    id: 'vis-004',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['maximal', 'boldcolor', 'curved'],
    palette: ['#E8C4B8', '#C89F94', '#D4A29B', '#F5E6E0'],
  },
  {
    id: 'vis-005',
    url: 'https://images.unsplash.com/photo-1595399874451-7843a0e8ea3d?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['coquette', 'pastel', 'soft_light', 'curved'],
    palette: ['#F8E8E8', '#E8D8D8', '#F5E6E6', '#FDF5F5'],
  },
  {
    id: 'vis-006',
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['organic', 'natural_fiber', 'neutral_palette', 'soft_light'],
    palette: ['#8BA888', '#6B8E6F', '#A4C2A0', '#C8D4C8'],
  },
  {
    id: 'vis-007',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['vintage', 'natural_fiber', 'neutral_palette'],
    palette: ['#D5C7BC', '#B8A89A', '#9B8B7E', '#E8DCC8'],
  },
  {
    id: 'vis-008',
    url: 'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['midcentury', 'curved', 'natural_fiber', 'boldcolor'],
    palette: ['#C17767', '#E8A598', '#D4886C', '#8B4513'],
  },
  {
    id: 'vis-009',
    url: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['industrial', 'angular', 'high_contrast', 'metallic'],
    palette: ['#3E4E5E', '#6B7C8C', '#2C3A4A', '#8B9AA8'],
  },
  {
    id: 'vis-010',
    url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['glasscore', 'soft_light', 'minimal', 'curved'],
    palette: ['#E8F4F8', '#C8D8E8', '#F0F8FF', '#D0E8F8'],
  },
  {
    id: 'vis-011',
    url: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['monochrome', 'minimal', 'angular', 'high_contrast'],
    palette: ['#000000', '#FFFFFF', '#2C2C2C', '#E8E8E8'],
  },
  {
    id: 'vis-012',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['coastal', 'pastel', 'soft_light', 'organic'],
    palette: ['#B8D4E8', '#D4E8F0', '#A8C8D8', '#E8F4F8'],
  },
  {
    id: 'vis-013',
    url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['brutalist', 'monochrome', 'angular', 'high_contrast'],
    palette: ['#1C1C1C', '#3C3C3C', '#5C5C5C', '#2C2C2C'],
  },
  {
    id: 'vis-014',
    url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['minimal', 'curved', 'soft_light', 'neutral_palette'],
    palette: ['#F8F8F8', '#E8E8E8', '#F0F0F0', '#FAFAFA'],
  },
  {
    id: 'vis-015',
    url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['maximal', 'boldcolor', 'organic', 'natural_fiber'],
    palette: ['#D84315', '#FF6F00', '#F4511E', '#BF360C'],
  },
  {
    id: 'vis-016',
    url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['coquette', 'pastel', 'curved', 'soft_light'],
    palette: ['#FFE8F0', '#FFD8E8', '#FFF0F8', '#FFE0F0'],
  },
  {
    id: 'vis-017',
    url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['vintage', 'natural_fiber', 'neutral_palette', 'soft_light'],
    palette: ['#C8B8A8', '#A89888', '#E8D8C8', '#D8C8B8'],
  },
  {
    id: 'vis-018',
    url: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['midcentury', 'curved', 'natural_fiber', 'neutral_palette'],
    palette: ['#D4A574', '#C89F64', '#E8C49C', '#B8956C'],
  },
  {
    id: 'vis-019',
    url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['industrial', 'metallic', 'angular', 'monochrome'],
    palette: ['#4E5C6E', '#6E7C8E', '#3E4C5E', '#8E9CAE'],
  },
  {
    id: 'vis-020',
    url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['glasscore', 'minimal', 'soft_light', 'neutral_palette'],
    palette: ['#F0F8FF', '#E0F0FF', '#D8E8F8', '#E8F4FF'],
  },
  {
    id: 'vis-021',
    url: 'https://images.unsplash.com/photo-1595428773304-d6d2ebe04c0f?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['coastal', 'organic', 'neutral_palette', 'natural_fiber'],
    palette: ['#C8D8C8', '#A8B8A8', '#D8E8D8', '#B8C8B8'],
  },
  {
    id: 'vis-022',
    url: 'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['brutalist', 'angular', 'high_contrast', 'monochrome'],
    palette: ['#1A1A1A', '#3A3A3A', '#0A0A0A', '#2A2A2A'],
  },
  {
    id: 'vis-023',
    url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['maximal', 'boldcolor', 'curved', 'metallic'],
    palette: ['#FFD700', '#FFA500', '#FF8C00', '#FFB347'],
  },
  {
    id: 'vis-024',
    url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['coquette', 'pastel', 'soft_light', 'organic'],
    palette: ['#E8D8F0', '#F0E0F8', '#D8C8E8', '#F8E8FF'],
  },
  {
    id: 'vis-025',
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['vintage', 'organic', 'neutral_palette', 'natural_fiber'],
    palette: ['#8B7355', '#A68A6A', '#6E5C4A', '#C8B09F'],
  },
  {
    id: 'vis-026',
    url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['midcentury', 'boldcolor', 'angular', 'natural_fiber'],
    palette: ['#E85D4C', '#F47C6B', '#D84C3B', '#FF8C7A'],
  },
  {
    id: 'vis-027',
    url: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['industrial', 'metallic', 'high_contrast', 'angular'],
    palette: ['#5C6E7E', '#7C8E9E', '#4C5E6E', '#8C9EAE'],
  },
  {
    id: 'vis-028',
    url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop',
    source: 'Unsplash',
    tags: ['glasscore', 'soft_light', 'curved', 'minimal'],
    palette: ['#F8FCFF', '#E8F4F8', '#D8ECF0', '#E0F0F8'],
  },
];

/**
 * Get all visual items including admin-uploaded images from localStorage
 */
export function getAllVisualItems(): VisualItem[] {
  const adminImagesJson = localStorage.getItem('adminImages');
  
  if (!adminImagesJson) {
    return visualItems;
  }

  try {
    const adminImages: AdminImage[] = JSON.parse(adminImagesJson);
    
    const adminVisualItems: VisualItem[] = adminImages.map((img) => ({
      id: img.id,
      url: img.url,
      source: img.source,
      tags: img.tags as AestheticTag[], // Admin should ensure valid tags
      palette: img.colors as ColorHex[],
    }));

    return [...visualItems, ...adminVisualItems];
  } catch (error) {
    console.error('Failed to parse admin images:', error);
    return visualItems;
  }
}
