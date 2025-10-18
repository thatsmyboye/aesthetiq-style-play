import { useMemo, useState } from 'react';
import { useTasteState } from '@/state/tasteState';
import { useFavorites } from '@/state/favorites';
import { usePremium } from '@/state/premium';
import { seedProducts } from '@/data/seedProducts';
import { calculateMatchScore } from '@/utils/aestheticAnalysis';
import { generateVibeLabels } from '@/utils/vibeLabels';
import { generateMatchReasons } from '@/utils/scoreExplanation';
import { getAffiliateUrl } from '@/utils/affiliate';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Sparkles, 
  ExternalLink, 
  Heart,
  TrendingUp,
  Palette as PaletteIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TAG_LABELS } from '@/utils/vibeLabels';

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

    // Rank by match score
    return products
      .map((product) => ({
        ...product,
        matchScore: calculateMatchScore(product.tags, product.colors, fingerprint),
      }))
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
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
              Matched to your vibe: <span className="text-foreground font-medium">{vibeLabels.join(' • ')}</span>
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
        {paginatedProducts.map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20"
          >
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
                onClick={() => handleFavoriteToggle(product.id, product.brand)}
              >
                <Heart
                  className="w-4 h-4"
                  fill={isFavorite(product.id) ? 'currentColor' : 'none'}
                />
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

              {/* Premium: Match Insights */}
              {isPremium && fingerprint && (
                <div className="bg-accent/10 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-accent-foreground">
                    <TrendingUp className="w-3 h-3" />
                    Why it matches
                  </div>
                  {(() => {
                    const reasons = generateMatchReasons(
                      product.tags,
                      product.colors,
                      fingerprint
                    );
                    return reasons.length > 0 ? (
                      <div className="space-y-1.5">
                        {reasons.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            {reason.type === 'tag' ? (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                <Sparkles className="w-2.5 h-2.5 mr-1" />
                                {reason.score}%
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                <PaletteIcon className="w-2.5 h-2.5 mr-1" />
                                {reason.score}%
                              </Badge>
                            )}
                            <span className="text-muted-foreground">{reason.details}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Similar to your aesthetic</p>
                    );
                  })()}
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <p className="text-xl font-semibold text-primary">${product.price}</p>
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>

              {/* View Product Button */}
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Generate affiliate URL
                  const brandId = product.brand.toLowerCase().replace(/\s+/g, '-');
                  const affiliateUrl = getAffiliateUrl(
                    product.imageUrl, // Mock URL - in real app this would be product.url
                    brandId
                  );
                  window.open(affiliateUrl, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Product
              </Button>
            </CardContent>
          </Card>
        ))}
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
