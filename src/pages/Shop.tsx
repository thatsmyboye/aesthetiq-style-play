import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTasteState } from '@/state/tasteState';
import { useFavorites } from '@/state/favorites';
import { usePremium } from '@/state/premium';
import { seedProducts } from '@/data/seedProducts';
import { calculateMatchScore } from '@/utils/aestheticAnalysis';
import { generateVibeLabels } from '@/utils/vibeLabels';
import { mmr } from '@/utils/mmr';
import { productSimilarity } from '@/utils/similarity';
import { logEvent } from '@/state/events';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sparkles, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ProductCard } from '@/components/ProductCard';
import { getMeter, bumpMeter } from '@/state/premium';
import { FREE_METERS } from '@/config/premium';
import { usePremium as usePremiumHook } from '@/hooks/usePremium';
import Paywall from '@/components/Paywall';

type PriceTier = 'all' | '$' | '$$' | '$$$';
type Category = 'all' | 'Fashion' | 'Furniture' | 'Home Decor' | 'Art';

const Shop = () => {
  const { getFingerprint } = useTasteState();
  const { favorites, addFavorite, removeFavorite, isFavorite, getRecentBrands } = useFavorites();
  const { isPremium } = usePremium();
  const { premium } = usePremiumHook();
  const fingerprint = getFingerprint();
  const recentBrands = getRecentBrands(8);
  
  const [priceTier, setPriceTier] = useState<PriceTier>('all');
  const [category, setCategory] = useState<Category>('all');
  const [page, setPage] = useState(1);
  const [showDisclosure, setShowDisclosure] = useState(true);
  const [deepMatches, setDeepMatches] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [searchParams] = useSearchParams();
  const itemsPerPage = 24;

  // Get deck context from URL or session
  const deckId = useMemo(() => {
    const fromUrl = searchParams.get("fromDeck");
    if (fromUrl) return fromUrl;
    try {
      return sessionStorage.getItem("deck_ctx");
    } catch {
      return null;
    }
  }, [searchParams]);

  useEffect(() => {
    // Check if user has dismissed disclosure before
    try {
      const dismissed = localStorage.getItem("aff_disclosure_dismissed");
      if (dismissed) setShowDisclosure(false);
    } catch {}
  }, []);

  const dismissDisclosure = () => {
    setShowDisclosure(false);
    try {
      localStorage.setItem("aff_disclosure_dismissed", "true");
    } catch {}
  };

  const vibeLabels = useMemo(() => {
    if (!fingerprint) return [];
    return generateVibeLabels(fingerprint.topTags.reduce((acc, tag) => {
      acc[tag] = 1;
      return acc;
    }, {} as Record<string, number>));
  }, [fingerprint]);

  const filteredAndRankedProducts = useMemo(() => {
    let products = seedProducts;
    
    // Apply filters
    if (priceTier !== 'all') {
      products = products.filter((p) => {
        if (priceTier === '$') return p.price < 100;
        if (priceTier === '$$') return p.price >= 100 && p.price < 250;
        if (priceTier === '$$$') return p.price >= 250;
        return true;
      });
    }
    
    if (category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    if (!fingerprint) return products;

    // Score products and sort by relevance
    const scored = products
      .map((product) => ({
        product,
        matchScore: calculateMatchScore(product.tags, product.colors, fingerprint),
      }))
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    // Apply MMR to diversify top results (premium gets higher K and lambda)
    const N = Math.min(50, scored.length);     // re-rank top 50
    const K = premium ? Math.min(20, N) : Math.min(16, N);  // premium: more diverse
    const LAMBDA = premium ? 0.78 : 0.75;      // premium: slightly more relevance

    const diversified = mmr({
      candidates: scored.slice(0, N),
      k: K,
      lambda: LAMBDA,
      relevance: (x) => x.matchScore || 0,
      similarity: (a, b) => productSimilarity(a.product, b.product),
    });

    // Combine: diversified products + remaining tail
    const diversifiedProducts = diversified.map((x) => ({
      ...x.product,
      matchScore: x.matchScore,
    }));
    
    const remainingProducts = scored.slice(N).map((x) => ({
      ...x.product,
      matchScore: x.matchScore,
    }));

    return [...diversifiedProducts, ...remainingProducts];
  }, [fingerprint, priceTier, category, premium]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredAndRankedProducts.slice(start, start + itemsPerPage);
  }, [filteredAndRankedProducts, page]);

  const totalPages = Math.ceil(filteredAndRankedProducts.length / itemsPerPage);

  const handleFavoriteToggle = (productId: string, brand: string) => {
    if (isFavorite(productId)) {
      removeFavorite(productId);
      toast({ description: 'Removed from favorites' });
      logEvent("favorite_removed", { product_id: productId, deck_id: deckId });
    } else {
      addFavorite(productId, brand);
      toast({ description: 'Added to favorites' });
      logEvent("favorite_added", { product_id: productId, deck_id: deckId });
    }
  };

  const handleDeepMatchesToggle = () => {
    if (premium) {
      setDeepMatches(!deepMatches);
      return;
    }
    if (deepMatches) {
      setDeepMatches(false);
      return;
    }
    const used = getMeter("deepMatchesViews");
    if (used < FREE_METERS.deepMatchesViews) {
      bumpMeter("deepMatchesViews");
      setDeepMatches(true);
      toast({ description: `Deep Matches enabled (${FREE_METERS.deepMatchesViews - used - 1} free uses left)` });
    } else {
      logEvent("meter_exhausted", { feature: "deep", used });
      logEvent("paywall_shown", { feature: "deep" });
      setShowPaywall(true);
    }
  };

  if (!fingerprint) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center space-y-6 py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-accent-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Discover Your Style First</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              Hand-picked to match your vibe.
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Complete the swipe game to unlock personalized product recommendations that align with your unique aesthetic.
            </p>
          </div>
          <Button size="lg" onClick={() => window.location.href = '/play'}>
            Start Exploring
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6 animate-fade-in">
      {/* Affiliate Disclosure */}
      {showDisclosure && (
        <div className="bg-muted/50 border rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 text-sm">
              <p className="text-foreground/80">
                AesthetIQ may earn a commission from recommended products. We attach a click ID to measure which aesthetics convert. No personal info is shared.
              </p>
              <Button 
                variant="link" 
                className="h-auto p-0 text-sm" 
                onClick={() => window.open('/privacy', '_blank')}
              >
                Learn more
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={dismissDisclosure}
            >
              <X className="h-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-4 border-b space-y-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-3xl font-semibold text-foreground">Shop Your Aesthetic</h2>
            {isPremium && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Premium Insights
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">
              Matched to your vibe — click "Why?" for details
            </p>
            {deckId && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                From deck: {deckId}
              </Badge>
            )}
          </div>
          {fingerprint && vibeLabels.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{vibeLabels.join(' • ')}</span>
            </p>
          )}
        </div>

        {/* Deep Matches Toggle (premium feature) */}
        {premium && (
          <div className="flex justify-center">
            <Button
              variant={deepMatches ? "default" : "outline"}
              size="sm"
              onClick={handleDeepMatchesToggle}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Deep Matches {deepMatches ? "ON" : "OFF"}
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="flex gap-2">
            <Badge
              variant={priceTier === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPriceTier('all')}
            >
              All Prices
            </Badge>
            <Badge
              variant={priceTier === '$' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPriceTier('$')}
            >
              $ (&lt;$100)
            </Badge>
            <Badge
              variant={priceTier === '$$' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPriceTier('$$')}
            >
              $$ ($100-250)
            </Badge>
            <Badge
              variant={priceTier === '$$$' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPriceTier('$$$')}
            >
              $$$ ($250+)
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Badge
              variant={category === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategory('all')}
            >
              All
            </Badge>
            <Badge
              variant={category === 'Fashion' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategory('Fashion')}
            >
              Fashion
            </Badge>
            <Badge
              variant={category === 'Furniture' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategory('Furniture')}
            >
              Furniture
            </Badge>
            <Badge
              variant={category === 'Home Decor' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategory('Home Decor')}
            >
              Home Decor
            </Badge>
            <Badge
              variant={category === 'Art' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCategory('Art')}
            >
              Art
            </Badge>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProducts.map((product) => {
          // Convert fingerprint to vector-like structure
          const vector = fingerprint ? {
            tags: fingerprint.topTags.reduce((acc, tag) => ({ ...acc, [tag]: 0.8 }), {} as any),
            palette: fingerprint.dominantColors as any,
            confidence: 1,
            choices: fingerprint.topTags.length
          } : {
            tags: {} as any,
            palette: [] as any,
            confidence: 0,
            choices: 0
          };

          return (
            <ProductCard
              key={product.id}
              product={product}
              vector={vector}
              isFavorite={isFavorite(product.id)}
              onFavoriteToggle={() => handleFavoriteToggle(product.id, product.brand)}
              onViewProduct={() => {}}
              recentBrands={recentBrands}
              deckId={deckId}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                onClick={() => setPage(p)}
                className="w-10"
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <Paywall open={showPaywall} onClose={() => setShowPaywall(false)} feature="deep" />
    </div>
  );
};

export default Shop;
