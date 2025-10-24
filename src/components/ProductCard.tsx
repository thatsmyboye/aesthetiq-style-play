import React, { useState } from "react";
import type { AestheticVector } from "@/types/domain";
import { MatchChips } from "@/components/MatchChips";
import { MatchExplainModal } from "@/components/MatchExplainModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ExternalLink, Sparkles } from "lucide-react";
import { buildProductUrl } from "@/utils/outbound";
import { logEvent } from "@/state/events";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
    tags: any[];
    colors: string[];
    category: string;
    matchScore?: number;
    url?: string;
  };
  vector: AestheticVector;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onViewProduct: () => void;
  recentBrands?: string[];
  deckId?: string | null;
}

export function ProductCard({
  product,
  vector,
  isFavorite,
  onFavoriteToggle,
  onViewProduct,
  recentBrands = [],
  deckId = null,
}: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const productUrl = product.url 
    ? buildProductUrl({ 
        baseUrl: product.url, 
        brandId: product.brand, 
        deckId 
      })
    : "#";

  const handleProductClick = () => {
    logEvent("product_clicked", {
      product_id: product.id,
      brand: product.brand,
      deck_id: deckId,
      price: product.price,
      category: product.category
    });
    onViewProduct();
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={product.imageUrl}
          alt={`${product.name} by ${product.brand} - ${product.tags.slice(0, 3).join(', ')} aesthetic`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onFavoriteToggle}
        >
          <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
        </Button>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.brand}</p>
          </div>
          {product.matchScore && product.matchScore >= 60 && (
            <Badge variant="secondary" className="shrink-0">
              <Sparkles className="w-3 h-3 mr-1" />
              {product.matchScore}%
            </Badge>
          )}
        </div>

        <MatchChips
          product={product}
          vector={vector}
          onOpenModal={() => setModalOpen(true)}
          recentBrands={recentBrands}
        />

        <div className="flex items-center justify-between gap-2">
          <p className="text-xl font-semibold text-primary">${product.price}</p>
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
        </div>

        <Button 
          size="sm" 
          variant="outline" 
          className="w-full" 
          onClick={handleProductClick}
          asChild
        >
          <a href={productUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Product
          </a>
        </Button>
      </CardContent>

      <MatchExplainModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={product}
        vector={vector}
        recentBrands={recentBrands}
      />
    </Card>
  );
}
