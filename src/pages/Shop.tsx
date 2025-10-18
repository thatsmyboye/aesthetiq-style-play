import { useMemo } from 'react';
import { useTasteState } from '@/state/tasteState';
import { seedProducts } from '@/data/seedProducts';
import { calculateMatchScore } from '@/utils/aestheticAnalysis';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Sparkles } from 'lucide-react';

const Shop = () => {
  const { getFingerprint } = useTasteState();
  const fingerprint = getFingerprint();

  const rankedProducts = useMemo(() => {
    if (!fingerprint) return seedProducts;

    return seedProducts
      .map((product) => ({
        ...product,
        matchScore: calculateMatchScore(product.tags, product.colors, fingerprint),
      }))
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [fingerprint]);

  if (!fingerprint) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center space-y-4 py-12 animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-full bg-secondary/30 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Discover Your Style First</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Complete the swipe game to unlock personalized product recommendations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold text-foreground">Shop Your Aesthetic</h2>
        <p className="text-muted-foreground">Curated products that match your unique style</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rankedProducts.map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
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
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold text-primary">${product.price}</p>
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Shop;
