import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const validTags = [
  "minimal","maximal","midcentury","brutalist","coquette","vintage","industrial","organic",
  "glasscore","coastal","pastel","monochrome","boldcolor","natural_fiber","metallic",
  "curved","angular","soft_light","high_contrast","neutral_palette"
];

// Validation schema
const imageSchema = z.object({
  url: z.string().url("Invalid URL").max(2048),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color")),
  source: z.string().max(100).optional(),
});

interface AdminImage {
  id: string;
  url: string;
  tags: string[];
  palette: string[];
  source?: string;
  created_at?: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [adminImages, setAdminImages] = useState<AdminImage[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [paletteColors, setPaletteColors] = useState<string[]>(['#FFFFFF']);
  const [imageSource, setImageSource] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedImages, setParsedImages] = useState<ParsedImage[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);

  // Check authentication and admin role
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: 'Unauthorized',
        description: 'Admin privileges required',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [isAdmin, adminLoading, navigate]);

  // Load existing images from database
  useEffect(() => {
    async function loadImages() {
      if (!isAdmin) return;

      try {
        const { data, error } = await supabase
          .from('admin_images')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          setAdminImages(data);
        }
      } catch (e) {
        console.error('Failed to load admin images', e);
        toast({
          title: 'Error',
          description: 'Failed to load images from database',
          variant: 'destructive',
        });
      }
    }

    loadImages();
  }, [isAdmin]);

  // Save image to database
  async function saveImage(image: Omit<AdminImage, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('admin_images')
        .insert({
          url: image.url,
          tags: image.tags,
          palette: image.palette,
          source: image.source,
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setAdminImages(prev => [data, ...prev]);
      }
      
      return true;
    } catch (e) {
      console.error('Failed to save admin image', e);
      throw e;
    }
  }

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

  const handleAddImage = async () => {
    // Validate inputs
    const result = imageSchema.safeParse({
      url: imageUrl.trim(),
      tags: selectedTags,
      colors: paletteColors.filter(c => c.trim()),
      source: imageSource?.trim() || undefined,
    });

    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    try {
      await saveImage({
        url: result.data.url,
        tags: result.data.tags,
        palette: result.data.colors,
        source: result.data.source,
      });

      // Reset form
      setImageUrl('');
      setSelectedTags([]);
      setPaletteColors(['#FFFFFF']);
      setImageSource('');

      toast({
        title: 'Image Added',
        description: 'Image successfully added to the library',
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to add image',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAdminImages(prev => prev.filter(img => img.id !== id));
      toast({
        title: 'Image Deleted',
        description: 'Image removed from the library',
      });
    } catch (e) {
      console.error('Failed to delete image', e);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    }
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

  const handleApproveCsv = async () => {
    if (parsedImages.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('admin_images')
        .insert(
          parsedImages.map(img => ({
            url: img.url,
            tags: img.tags,
            palette: img.palette,
            source: img.source,
          }))
        )
        .select();

      if (error) throw error;

      if (data) {
        setAdminImages(prev => [...data, ...prev]);
        toast({
          title: 'Images Added',
          description: `${parsedImages.length} image(s) added to the library`,
        });
      }

      // Reset CSV form
      setCsvFile(null);
      setParsedImages([]);
      setParseErrors([]);
      setShowCsvPreview(false);
    } catch (e) {
      console.error('Failed to import CSV', e);
      toast({
        title: 'Error',
        description: 'Failed to import images',
        variant: 'destructive',
      });
    }
  };

  const totalImages = seedImages.length + adminImages.length;

  if (adminLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground">Content management and analytics</p>
        <Badge variant="outline" className="text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Admin Access Required
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
            <CardTitle>Custom Images Library ({adminImages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {adminImages.map((img) => (
                  <div key={img.id} className="border rounded-lg p-4 space-y-3">
                    <img
                      src={img.url}
                      alt="admin"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300';
                      }}
                    />
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {img.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {img.palette.map((color) => (
                          <div
                            key={color}
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      {img.source && (
                        <p className="text-xs text-muted-foreground">
                          Source: {img.source}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(img.id)}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Admin;
