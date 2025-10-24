import { useMemo, useState } from 'react';
import { useTasteState } from '@/state/tasteState';
import { useFavorites } from '@/state/favorites';
import { usePremium } from '@/state/premium';
import { seedProducts } from '@/data/seedProducts';
import { calculateMatchScore } from '@/utils/aestheticAnalysis';
import { generateVibeLabels } from '@/utils/vibeLabels';
import { getAffiliateUrl } from '@/utils/affiliate';
import { mmr } from '@/utils/mmr';
import { productSimilarity } from '@/utils/similarity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ProductCard } from '@/components/ProductCard';

type PriceTier = 'all' | '$' | '$$' | '$$$';
type Category = 'all' | 'Fashion' | 'Furniture' | 'Home Decor' | 'Art';

const Shop = () => {
  const { getFingerprint } = useTasteState();
  const { favorites, addFavorite, removeFavorite, isFavorite, getRecentBrands } = useFavorites();
  const { isPremium } = usePremium();
  const fingerprint = getFingerprint();
  const recentBrands = getRecentBrands(8);
  
  const [priceTier, setPriceTier] = useState<PriceTier>('all');
  const [category, setCategory] = useState<Category>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 24;

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

    // Apply MMR to diversify top results
    const N = Math.min(50, scored.length);     // re-rank top 50
    const K = Math.min(16, N);                 // ensure first 16 are diversified
    const LAMBDA = 0.75;                       // relevance-weight

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
  }, [fingerprint, priceTier, category]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredAndRankedProducts.slice(start, start + itemsPerPage);
  }, [filteredAndRankedProducts, page]);

  const totalPages = Math.ceil(filteredAndRankedProducts.length / itemsPerPage);

  const handleFavoriteToggle = (productId: string, brand: string) => {
    if (isFavorite(productId)) {
      removeFavorite(productId);
      toast({ description: 'Removed from favorites' });
    } else {
      addFavorite(productId, brand);
      toast({ description: 'Added to favorites' });
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
          {fingerprint && vibeLabels.length > 0 && (
            <p className="text-muted-foreground">
              Matched to your vibe — click "Why?" for details
            </p>
          )}
          {fingerprint && vibeLabels.length > 0 && (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{vibeLabels.join(' • ')}</span>
            </p>
          )}
        </div>

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
              onViewProduct={() => {
                const brandId = product.brand.toLowerCase().replace(/\s+/g, '-');
                const affiliateUrl = getAffiliateUrl(product.imageUrl, brandId);
                window.open(affiliateUrl, '_blank');
              }}
              recentBrands={recentBrands}
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
    </div>
  );
};

export default Shop;
