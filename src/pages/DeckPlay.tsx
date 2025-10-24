import { useParams, Link, useNavigate } from "react-router-dom";
import { getDeck } from "@/state/decks";
import { getAllVisualItems } from "@/data/images";
import { products } from "@/data/products";
import { useEffect, useMemo, useState } from "react";
import { useTasteStore } from "@/state/taste";
import { trackFeature } from "@/utils/tracking";
import { bumpObs } from "@/state/observations";
import { loadObs } from "@/state/observations";
import type { VisualItem, Product, AestheticTag } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

type DeckItem = VisualItem | Product;

const DeckPlay = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const deck = deckId ? getDeck(deckId) : null;
  const { vector, choose } = useTasteStore();
  
  const [pair, setPair] = useState<[DeckItem, DeckItem] | null>(null);
  const [index, setIndex] = useState(0);
  const [obs, setObs] = useState(() => {
    const tags = Object.keys(vector.tags);
    return loadObs(tags as AestheticTag[]);
  });
  const [choiceCount, setChoiceCount] = useState(0);

  const items = useMemo(() => {
    if (!deck) return [];
    const source = deck.source === "products" ? products : getAllVisualItems();
    const dict = new Map<string, VisualItem | Product>();
    source.forEach((x) => dict.set(x.id, x));
    const result: DeckItem[] = [];
    for (const id of deck.itemIds) {
      const item = dict.get(id);
      if (item) result.push(item);
    }
    return result;
  }, [deck]);

  useEffect(() => {
    if (deck) {
      trackFeature("deck_opened", { deckId: deck.id, creatorId: deck.creatorId });
      sessionStorage.setItem("currentDeckId", deck.id);
    }
    
    return () => {
      sessionStorage.removeItem("currentDeckId");
    };
  }, [deck]);

  useEffect(() => {
    if (items.length >= 2) {
      setPair([items[0], items[1]]);
    }
  }, [items]);

  const nextPair = () => {
    if (items.length < 2) return;
    
    const nextIndex = (index + 1) % items.length;
    const a = items[nextIndex];
    const b = items[(nextIndex + 1) % items.length];
    setIndex(nextIndex);
    setPair([a, b]);
  };

  const handleChoose = (chosen: DeckItem, rejected: DeckItem) => {
    // Update vector
    const chosenVis = chosen as VisualItem;
    const rejectedVis = rejected as VisualItem;
    choose(chosenVis, rejectedVis);

    // Update observations
    const nextObs = bumpObs(obs, [chosenVis, rejectedVis]);
    setObs(nextObs);

    // Track choice
    trackFeature("deck_choice", {
      deckId: deck?.id,
      chosen: chosen.id,
      rejected: rejected.id,
    });

    setChoiceCount((prev) => prev + 1);
    nextPair();
  };

  const handleExitToShop = () => {
    if (deck) {
      trackFeature("deck_exit_to_shop", { deckId: deck.id });
      const params = new URLSearchParams({
        fromDeck: deck.id,
        brands: deck.creatorId,
      });
      navigate(`/shop?${params.toString()}`);
    }
  };

  if (!deck) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Deck not found</h1>
        <Link to="/decks" className="text-primary hover:underline">
          View all decks
        </Link>
      </div>
    );
  }

  if (items.length < 2) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Not enough items in this deck</h1>
        <Link to="/decks" className="text-primary hover:underline">
          View all decks
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/decks"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          All decks
        </Link>
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">{deck.title}</h1>
            <p className="text-sm text-muted-foreground">
              {deck.creatorId}
              {deck.sponsored && deck.sponsorLabel && ` • ${deck.sponsorLabel}`}
            </p>
            {deck.description && (
              <p className="text-sm text-muted-foreground mt-2">{deck.description}</p>
            )}
          </div>
          
          {deck.source === "products" && (
            <Button onClick={handleExitToShop} variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              View in Shop
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4 text-center">
        <p className="text-sm text-muted-foreground">
          {choiceCount} {choiceCount === 1 ? "choice" : "choices"} made
        </p>
      </div>

      {/* Pair Display */}
      {pair && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map((ix) => {
            const item = pair[ix];
            const isProduct = "price" in item;
            const imageUrl = isProduct ? (item as Product).image : (item as VisualItem).url;
            const title = isProduct
              ? (item as Product).title
              : (item as VisualItem).id;
            const subtitle = isProduct
              ? (item as Product).brand
              : (item as VisualItem).source || "";

            return (
              <button
                key={item.id}
                onClick={() => handleChoose(item, pair[1 - ix])}
                className="group relative rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary active:scale-[0.98]"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                  {subtitle && (
                    <div className="text-xs text-white/80 mb-1">{subtitle}</div>
                  )}
                  <div className="text-sm font-medium text-white truncate">{title}</div>
                  {isProduct && (
                    <div className="text-sm text-white/90 mt-1">
                      ${(item as Product).price}
                    </div>
                  )}
                </div>

                {/* Hover indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                    <svg
                      className="w-8 h-8 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Sponsored disclosure */}
      {deck.sponsored && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Ad — Based on your aesthetic
          </p>
        </div>
      )}
    </div>
  );
};

export default DeckPlay;
