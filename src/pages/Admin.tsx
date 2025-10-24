import { useState, useEffect } from 'react';
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
import { seedImages } from '@/data/seedImages';
import { seedProducts } from '@/data/seedProducts';
import { 
  BarChart3, 
  Image as ImageIcon, 
  Package, 
  Tags, 
  Upload, 
  Plus, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { parseImageCSV, ParsedImage } from '@/utils/imageCSV';

const validTags = [
  "minimal","maximal","midcentury","brutalist","coquette","vintage","industrial","organic",
  "glasscore","coastal","pastel","monochrome","boldcolor","natural_fiber","metallic",
  "curved","angular","soft_light","high_contrast","neutral_palette"
];

interface AdminImage {
  id: string;
  url: string;
  tags: string[];
  colors: string[];
  source?: string;
}

const Admin = () => {
  const [adminImages, setAdminImages] = useState<AdminImage[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [paletteColors, setPaletteColors] = useState<string[]>(['#FFFFFF']);
  const [imageSource, setImageSource] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedImages, setParsedImages] = useState<ParsedImage[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);

  

  // Load admin images from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('adminImages');
    if (stored) {
      setAdminImages(JSON.parse(stored));
    }
  }, []);

  const saveAdminImages = (images: AdminImage[]) => {
    localStorage.setItem('adminImages', JSON.stringify(images));
    setAdminImages(images);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addColorToPalette = () => {
    setPaletteColors((prev) => [...prev, '#FFFFFF']);
  };

  const updateColor = (index: number, color: string) => {
    setPaletteColors((prev) => {
      const updated = [...prev];
      updated[index] = color;
      return updated;
    });
  };

  const removeColor = (index: number) => {
    setPaletteColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) {
      toast({
        title: 'Missing URL',
        description: 'Please enter an image URL',
        variant: 'destructive',
      });
      return;
    }

    if (selectedTags.length === 0) {
      toast({
        title: 'Missing Tags',
        description: 'Please select at least one tag',
        variant: 'destructive',
      });
      return;
    }

    if (paletteColors.length === 0) {
      toast({
        title: 'Missing Palette',
        description: 'Please add at least one color',
        variant: 'destructive',
      });
      return;
    }

    const newImage: AdminImage = {
      id: `admin-img-${Date.now()}`,
      url: imageUrl,
      tags: selectedTags,
      colors: paletteColors.filter(Boolean),
      source: imageSource || undefined,
    };

    saveAdminImages([...adminImages, newImage]);

    // Reset form
    setImageUrl('');
    setSelectedTags([]);
    setPaletteColors(['#FFFFFF']);
    setImageSource('');

    toast({
      title: 'Image Added',
      description: 'Image successfully added to the library',
    });
  };

  const handleDeleteImage = (id: string) => {
    saveAdminImages(adminImages.filter((img) => img.id !== id));
    toast({
      title: 'Image Deleted',
      description: 'Image removed from the library',
    });
  };

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

  const handleParseCSV = async () => {
    if (!csvFile) {
      toast({
        title: 'No File',
        description: 'Please select a CSV file first',
        variant: 'destructive',
      });
      return;
    }

    const text = await csvFile.text();
    const result = parseImageCSV(text);

    setParsedImages(result.images);
    setParseErrors(result.errors);
    setShowCsvPreview(true);

    if (result.errors.length > 0) {
      toast({
        title: 'Parsing Errors',
        description: `${result.errors.length} error(s) found`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `${result.images.length} image(s) parsed successfully`,
      });
    }
  };

  const handleApproveCsv = () => {
    if (parsedImages.length === 0) return;

    const newImages: AdminImage[] = parsedImages.map((img, idx) => ({
      id: `admin-img-csv-${Date.now()}-${idx}`,
      url: img.url,
      tags: img.tags,
      colors: img.palette,
      source: img.source,
    }));

    saveAdminImages([...adminImages, ...newImages]);

    toast({
      title: 'Images Added',
      description: `${parsedImages.length} image(s) added to the library`,
    });

    // Reset CSV form
    setCsvFile(null);
    setParsedImages([]);
    setParseErrors([]);
    setShowCsvPreview(false);
  };

  const totalImages = seedImages.length + adminImages.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground">Content management and analytics</p>
        <Badge variant="outline" className="text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Internal only (MVP)
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{totalImages}</p>
                <p className="text-sm text-muted-foreground">
                  Images ({adminImages.length} custom)
                </p>
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
                <p className="text-2xl font-semibold">{validTags.length}</p>
                <p className="text-sm text-muted-foreground">Valid Tags</p>
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

      {/* Add Image Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL *</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags * (Select Multiple)</Label>
            <div className="flex flex-wrap gap-2 p-4 border rounded-lg min-h-[60px]">
              {validTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedTags.join(', ')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Palette Colors *</Label>
              <Button size="sm" variant="outline" onClick={addColorToPalette}>
                <Plus className="w-4 h-4 mr-1" />
                Add Color
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {paletteColors.map((color, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(idx, e.target.value)}
                    className="w-12 h-12 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={color}
                    onChange={(e) => updateColor(idx, e.target.value)}
                    className="w-24 font-mono text-sm"
                    placeholder="#FFFFFF"
                  />
                  {paletteColors.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeColor(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageSource">Source (Optional)</Label>
            <Input
              id="imageSource"
              value={imageSource}
              onChange={(e) => setImageSource(e.target.value)}
              placeholder="Credit or source"
            />
          </div>

          <Button onClick={handleAddImage} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        </CardContent>
      </Card>

      {/* CSV Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload (CSV)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>CSV File (url, tags, palette, source)</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button onClick={handleParseCSV} disabled={!csvFile}>
                <Upload className="w-4 h-4 mr-2" />
                Parse
              </Button>
            </div>
          </div>

          {/* CSV Preview */}
          {showCsvPreview && (
            <div className="space-y-4">
              {parseErrors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-semibold">
                    <XCircle className="w-5 h-5" />
                    Errors Found
                  </div>
                  <ScrollArea className="h-32">
                    <ul className="text-sm space-y-1 text-destructive">
                      {parseErrors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              {parsedImages.length > 0 && (
                <>
                  <ScrollArea className="h-96 border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Preview</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Tags</TableHead>
                          <TableHead>Palette</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedImages.map((img, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              <img
                                src={img.url}
                                alt="preview"
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/64';
                                }}
                              />
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-xs">
                              {img.url}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {img.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {img.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{img.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {img.palette.slice(0, 4).map((color) => (
                                  <div
                                    key={color}
                                    className="w-6 h-6 rounded border"
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

                  {parseErrors.length === 0 && (
                    <Button onClick={handleApproveCsv} className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Add {parsedImages.length} Image(s)
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Images Library */}
      {adminImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Images ({adminImages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {adminImages.map((image) => (
                <div key={image.id} className="space-y-2 group relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                    <img
                      src={image.url}
                      alt={image.id}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {image.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {image.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{image.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {image.colors.slice(0, 4).map((color) => (
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
      )}
    </div>
  );
};

export default Admin;
