import React from "react";
import type { AestheticVector, AestheticTag } from "@/types/domain";
import { getMatchReasons } from "@/utils/reasons";
import { PREMIUM_MODE } from "@/config/app";
import { Badge } from "@/components/ui/badge";

interface ProductLike {
  tags: AestheticTag[];
  colors: string[];
  brand: string;
}

export function MatchChips({
  product,
  vector,
  onOpenModal,
  compact = false,
  recentBrands = [],
}: {
  product: ProductLike;
  vector: AestheticVector;
  onOpenModal?: () => void;
  compact?: boolean;
  recentBrands?: string[];
}) {
  const { tagsPretty, palettePct } = getMatchReasons(product, vector, recentBrands);
  const visibleTags = PREMIUM_MODE ? tagsPretty : tagsPretty.slice(0, 2);
  
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
      {visibleTags.map((t, i) => (
        <Badge
          key={t + i}
          variant="outline"
          className="text-xs"
          aria-label={`Reason ${i + 1}: ${t}`}
        >
          {t}
        </Badge>
      ))}
      <Badge
        variant="outline"
        className="text-xs"
        aria-label={`Palette match ${palettePct} percent`}
      >
        Palette {palettePct}%
      </Badge>
      {PREMIUM_MODE ? (
        <button
          type="button"
          className="ml-1 text-xs underline decoration-dotted text-muted-foreground hover:text-foreground transition-colors"
          onClick={onOpenModal}
          aria-label="See full match explanation"
        >
          Why?
        </button>
      ) : (
        <button
          type="button"
          className="ml-1 text-xs underline text-muted-foreground hover:text-foreground transition-colors"
          onClick={onOpenModal}
          aria-label="Unlock full match explanation"
        >
          Unlock details
        </button>
      )}
    </div>
  );
}
