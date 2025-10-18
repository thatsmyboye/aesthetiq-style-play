import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { seedImages } from '@/data/seedImages';
import { seedProducts } from '@/data/seedProducts';
import { BarChart3, Image, Package, Tags } from 'lucide-react';

const Admin = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground">Content management and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Image className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{seedImages.length}</p>
                <p className="text-sm text-muted-foreground">Images</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{seedProducts.length}</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center">
                <Tags className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">24</p>
                <p className="text-sm text-muted-foreground">Unique Tags</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">5</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Library */}
      <Card>
        <CardHeader>
          <CardTitle>Image Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {seedImages.map((image) => (
              <div key={image.id} className="space-y-2">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image.url}
                    alt={image.id}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs">
                    {image.category}
                  </Badge>
                  <div className="flex flex-wrap gap-1">
                    {image.colors.slice(0, 3).map((color) => (
                      <div
                        key={color}
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Catalog */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {seedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">${product.price}</p>
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
