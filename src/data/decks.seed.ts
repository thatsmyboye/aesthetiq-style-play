import type { Deck } from "@/types/deck";

export const seedDecks: Deck[] = [
  {
    id: "coastal-calm",
    title: "Coastal Calm Collection",
    creatorId: "Seaside Home",
    source: "products",
    description: "Curated pieces inspired by the ocean and natural textures",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop",
    tags: ["coastal", "organic", "neutral_palette", "soft_light"],
    palette: ["#C8D8C8", "#A8B8A8", "#E8DCC8", "#B8D4E8"],
    itemIds: ["prod-011", "prod-024", "prod-035", "prod-042"],
    sponsored: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "minimal-essentials",
    title: "Minimal Essentials",
    creatorId: "Studio Norden",
    source: "products",
    description: "Clean lines and neutral tones for a serene space",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop",
    tags: ["minimal", "neutral_palette", "soft_light", "curved"],
    palette: ["#FFFFFF", "#F5F5F5", "#E8E8E8", "#D8C8B8"],
    itemIds: ["prod-001", "prod-005", "prod-023", "prod-028", "prod-038"],
    sponsored: true,
    sponsorLabel: "Featured Collection",
    createdAt: new Date().toISOString(),
  },
];

export function initializeDecks() {
  const existing = localStorage.getItem("aesthetiq.decks.v1");
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem("aesthetiq.decks.v1", JSON.stringify(seedDecks));
  }
}
