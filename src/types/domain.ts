export type AestheticTag =
  | 'minimal'
  | 'maximal'
  | 'midcentury'
  | 'brutalist'
  | 'coquette'
  | 'vintage'
  | 'industrial'
  | 'organic'
  | 'glasscore'
  | 'coastal'
  | 'pastel'
  | 'monochrome'
  | 'boldcolor'
  | 'natural_fiber'
  | 'metallic'
  | 'curved'
  | 'angular'
  | 'soft_light'
  | 'high_contrast'
  | 'neutral_palette';

export type ColorHex = `#${string}`;

export interface AestheticVector {
  // tag weights (−1..+1 range, start at 0)
  tags: Record<AestheticTag, number>;
  // palette centroid (simple mean of chosen images' hexes)
  palette: ColorHex[];
  // confidence (0..1) = number of choices / target
  confidence: number;
  choices: number;
}

export interface VisualItem {
  id: string;
  url: string;
  source?: string; // credit
  tags: AestheticTag[];
  palette: ColorHex[];
}

export interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  currency: 'USD';
  url: string; // affiliate or direct
  brand: string;
  tags: AestheticTag[];
  palette: ColorHex[];
}

export interface Brand {
  id: string;
  name: string;
  site?: string;
  contactEmail?: string;
}
