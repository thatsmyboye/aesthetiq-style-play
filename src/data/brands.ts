import { Brand } from '@/types/domain';

export const brands: Brand[] = [
  {
    id: 'brand-001',
    name: 'Studio Norden',
    site: 'https://studionorden.example',
    contactEmail: 'hello@studionorden.example',
  },
  {
    id: 'brand-002',
    name: 'Aesthe',
    site: 'https://aesthe.example',
    contactEmail: 'contact@aesthe.example',
  },
  {
    id: 'brand-003',
    name: 'Verde Living',
    site: 'https://verdeliving.example',
    contactEmail: 'info@verdeliving.example',
  },
  {
    id: 'brand-004',
    name: 'Hygge Home',
    site: 'https://hyggehome.example',
    contactEmail: 'hello@hyggehome.example',
  },
  {
    id: 'brand-005',
    name: 'Modern Gallery',
    site: 'https://moderngallery.example',
    contactEmail: 'art@moderngallery.example',
  },
  {
    id: 'brand-006',
    name: 'Craft & Co',
    site: 'https://craftandco.example',
    contactEmail: 'info@craftandco.example',
  },
  {
    id: 'brand-007',
    name: 'Lucent Studio',
    site: 'https://lucentstudio.example',
    contactEmail: 'hello@lucentstudio.example',
  },
  {
    id: 'brand-008',
    name: 'Urban Forge',
    site: 'https://urbanforge.example',
    contactEmail: 'shop@urbanforge.example',
  },
  {
    id: 'brand-009',
    name: 'Maison Luxe',
    site: 'https://maisonluxe.example',
    contactEmail: 'concierge@maisonluxe.example',
  },
  {
    id: 'brand-010',
    name: 'Raw Edge',
    site: 'https://rawedge.example',
    contactEmail: 'info@rawedge.example',
  },
  {
    id: 'brand-011',
    name: 'Seaside Home',
    site: 'https://seasidehome.example',
    contactEmail: 'hello@seasidehome.example',
  },
  {
    id: 'brand-012',
    name: 'Sugar & Clay',
    site: 'https://sugarandclay.example',
    contactEmail: 'hello@sugarandclay.example',
  },
  {
    id: 'brand-013',
    name: 'Heritage Finds',
    site: 'https://heritagefinds.example',
    contactEmail: 'vintage@heritagefinds.example',
  },
  {
    id: 'brand-014',
    name: 'Noir Gallery',
    site: 'https://noirgallery.example',
    contactEmail: 'art@noirgallery.example',
  },
  {
    id: 'brand-015',
    name: 'Pure Thread',
    site: 'https://purethread.example',
    contactEmail: 'info@purethread.example',
  },
  {
    id: 'brand-016',
    name: 'Lumière Co',
    site: 'https://lumiereco.example',
    contactEmail: 'light@lumiereco.example',
  },
  {
    id: 'brand-017',
    name: 'Reflect Studio',
    site: 'https://reflectstudio.example',
    contactEmail: 'hello@reflectstudio.example',
  },
  {
    id: 'brand-018',
    name: 'Soft Haven',
    site: 'https://softhaven.example',
    contactEmail: 'care@softhaven.example',
  },
  {
    id: 'brand-019',
    name: 'Pattern House',
    site: 'https://patternhouse.example',
    contactEmail: 'design@patternhouse.example',
  },
  {
    id: 'brand-020',
    name: 'Fiber Folk',
    site: 'https://fiberfolk.example',
    contactEmail: 'weave@fiberfolk.example',
  },
  {
    id: 'brand-021',
    name: 'Stone & Form',
    site: 'https://stoneandform.example',
    contactEmail: 'info@stoneandform.example',
  },
  {
    id: 'brand-022',
    name: 'Timeless Design',
    site: 'https://timelessdesign.example',
    contactEmail: 'hello@timelessdesign.example',
  },
];

// Helper to get brand by name
export function getBrandByName(brandName: string): Brand | undefined {
  return brands.find((b) => b.name === brandName);
}

// Helper to get all products for a brand
export function getBrandProducts(brandName: string) {
  // This would typically import products and filter
  // Keeping it simple for now
  return [];
}
