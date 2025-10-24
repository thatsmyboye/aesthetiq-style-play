import type { AestheticTag, ColorHex } from "@/types/domain";

export type DeckSource = "visuals" | "products";

export interface Deck {
  id: string;                 // slug
  title: string;              // "Seaworn Ceramics — Coastal Calm"
  creatorId: string;          // brand id or creator id
  source: DeckSource;         // where cards come from
  description?: string;
  coverImage?: string;
  tags: AestheticTag[];       // deck-level tags
  palette: ColorHex[];        // deck-level palette
  itemIds: string[];          // list of VisualItem ids or Product ids (see source)
  sponsored?: boolean;
  sponsorLabel?: string;      // "Sponsored by …"
  createdAt: string;          // ISO
  sponsorItems?: string[];    // extra SKUs for sponsored content
}
