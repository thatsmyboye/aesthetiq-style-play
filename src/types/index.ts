// Domain types for AesthetIQ

export interface AestheticImage {
  id: string;
  url: string;
  tags: string[];
  colors: string[];
  category: 'fashion' | 'interior' | 'art' | 'nature' | 'lifestyle';
  dominantColor: string;
}

export interface SwipeAction {
  imageId: string;
  liked: boolean;
  timestamp: number;
}

export interface AestheticFingerprint {
  dominantColors: string[];
  topTags: string[];
  categoryPreferences: Record<string, number>;
  colorHarmony: string; // e.g., 'warm', 'cool', 'neutral', 'vibrant'
  styleProfile: string; // e.g., 'minimalist', 'maximalist', 'eclectic'
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  tags: string[];
  colors: string[];
  category: string;
  matchScore?: number;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  products: Product[];
}

export interface UserPreferences {
  likedImages: string[];
  dislikedImages: string[];
  swipeHistory: SwipeAction[];
  fingerprint?: AestheticFingerprint;
}
