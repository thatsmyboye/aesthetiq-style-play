import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Store, Upload, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Partners = () => {
  const [formData, setFormData] = useState({
    brandName: '',
    productName: '',
    price: '',
    category: '',
    description: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Product Submitted',
      description: 'Your product will be reviewed and added to the catalog.',
    });
    // Reset form
    setFormData({
      brandName: '',
      productName: '',
      price: '',
      category: '',
      description: '',
      tags: '',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-accent-foreground" />
        </div>
        <h2 className="text-3xl font-semibold text-foreground">Brand Partner Portal</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          List your products and reach customers who love your aesthetic
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 py-6">
        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Easy Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Quick product submission with auto-tagging
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-2">
              <Package className="w-6 h-6 text-accent-foreground" />
            </div>
            <CardTitle className="text-lg">Smart Matching</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AI connects products with ideal customers
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 mx-auto rounded-full bg-secondary/40 flex items-center justify-center mb-2">
              <Store className="w-6 h-6 text-secondary-foreground" />
            </div>
            <CardTitle className="text-lg">Grow Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Reach engaged shoppers who love your style
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Your Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="Your Brand"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Product Name"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="99"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Fashion, Home Decor, Art..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Style Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="minimalist, cozy, modern, natural..."
              />
              <p className="text-xs text-muted-foreground">Separate tags with commas</p>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Submit Product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Partners;
