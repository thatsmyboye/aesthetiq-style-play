import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Store, Upload, CheckCircle, XCircle, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { parseCSV, ParsedProduct, getValidTags } from '@/utils/csv';
import { TAG_LABELS } from '@/utils/vibeLabels';

const Partners = () => {
  const [brandName, setBrandName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload a CSV file',
          variant: 'destructive',
        });
        return;
      }
      setCsvFile(file);
    }
  };

  const handleParse = async () => {
    if (!csvFile) {
      toast({
        title: 'No File',
        description: 'Please select a CSV file first',
        variant: 'destructive',
      });
      return;
    }

    const text = await csvFile.text();
    const result = parseCSV(text);

    setParsedProducts(result.products);
    setParseErrors(result.errors);
    setShowPreview(true);

    if (result.errors.length > 0) {
      toast({
        title: 'Parsing Errors',
        description: `${result.errors.length} error(s) found. Check the list below.`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `${result.products.length} product(s) parsed successfully`,
      });
    }
  };

  const handleApprove = () => {
    if (parsedProducts.length === 0) {
      return;
    }

    // Get existing partner products from localStorage
    const existing = localStorage.getItem('partnerProducts');
    const existingProducts = existing ? JSON.parse(existing) : [];

    // Add new products
    const newProducts = parsedProducts.map((p, idx) => ({
      id: `partner-${Date.now()}-${idx}`,
      name: p.title,
      imageUrl: p.image,
      price: p.price,
      brand: p.brand,
      tags: p.tags,
      colors: p.palette,
      category: 'Partner Product',
    }));

    localStorage.setItem(
      'partnerProducts',
      JSON.stringify([...existingProducts, ...newProducts])
    );

    toast({
      title: 'Products Added',
      description: `${parsedProducts.length} product(s) added to the catalog`,
    });

    // Reset form
    setBrandName('');
    setContactEmail('');
    setCsvFile(null);
    setParsedProducts([]);
    setParseErrors([]);
    setShowPreview(false);
  };

  const validTags = getValidTags();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-accent-foreground" />
            </div>
            <h2 className="text-3xl font-semibold text-foreground">Brand Partner Portal</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload your product catalog and reach customers who love your aesthetic
            </p>
          </div>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name *</Label>
                  <Input
                    id="brandName"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Your Brand"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@brand.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csvFile">Product CSV *</Label>
                <div className="flex gap-2">
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button onClick={handleParse} disabled={!csvFile}>
                    <Upload className="w-4 h-4 mr-2" />
                    Parse
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  CSV must include columns: title, image, price, url, brand, tags, palette
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {showPreview && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview</CardTitle>
                  {parsedProducts.length > 0 && parseErrors.length === 0 && (
                    <Button onClick={handleApprove}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Add
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Errors */}
                {parseErrors.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-destructive font-semibold">
                      <XCircle className="w-5 h-5" />
                      Errors Found
                    </div>
                    <ScrollArea className="h-40">
                      <ul className="text-sm space-y-1 text-destructive">
                        {parseErrors.map((error, idx) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>
                )}

                {/* Products Table */}
                {parsedProducts.length > 0 && (
                  <ScrollArea className="h-96 border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Tags</TableHead>
                          <TableHead>Palette</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedProducts.map((product, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{product.title}</TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>${product.price}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {product.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {TAG_LABELS[tag]}
                                  </Badge>
                                ))}
                                {product.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{product.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {product.palette.slice(0, 4).map((color) => (
                                  <div
                                    key={color}
                                    className="w-6 h-6 rounded border border-border"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tag Helper Sidebar */}
        <aside className="lg:w-80 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Valid Tags</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-3">
                  {validTags.map((tag) => (
                    <div key={tag} className="space-y-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {tag}
                      </Badge>
                      <p className="text-xs text-muted-foreground pl-2">
                        {TAG_LABELS[tag]}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CSV Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">Required columns:</p>
              <ul className="space-y-1 text-xs font-mono">
                <li>• title</li>
                <li>• image (URL)</li>
                <li>• price (number)</li>
                <li>• url (product link)</li>
                <li>• brand</li>
                <li>• tags (comma-separated)</li>
                <li>• palette (hex colors, comma-separated)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Example palette: #FFFFFF,#F5F5F5,#E8E8E8
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default Partners;
