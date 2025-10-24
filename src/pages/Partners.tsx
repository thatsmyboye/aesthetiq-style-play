import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { validateCsvText, EXPECTED_HEADERS, type ImportReport } from '@/utils/partner-validate';
import { ImportReportView } from '@/components/ImportReport';
import { loadProducts, saveProducts } from '@/state/products';
import { DeckBuilder } from '@/components/DeckBuilder';
import type { Product, AestheticTag } from '@/types/domain';

const VALID_TAGS = [
  "minimal","maximal","midcentury","brutalist","coquette","vintage","industrial","organic",
  "glasscore","coastal","pastel","monochrome","boldcolor","natural_fiber","metallic",
  "curved","angular","soft_light","high_contrast","neutral_palette"
] as const;

const Partners = () => {
  const [csvText, setCsvText] = useState<string>("");
  const [report, setReport] = useState<ImportReport | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; 
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result || ""));
    reader.readAsText(file);
  }

  function onValidate() {
    if (!csvText.trim()) {
      toast({
        title: 'No File',
        description: 'Please select a CSV file first',
        variant: 'destructive',
      });
      return;
    }
    const r = validateCsvText(csvText);
    setReport(r);
    
    if (r.counts.fail > 0) {
      toast({
        title: 'Validation Issues',
        description: `${r.counts.fail} row(s) failed validation. Check details below.`,
        variant: 'destructive',
      });
    } else if (r.counts.warn > 0) {
      toast({
        title: 'Validation Warnings',
        description: `${r.counts.warn} row(s) have warnings. Review before appending.`,
      });
    } else {
      toast({
        title: 'Success',
        description: `All ${r.counts.pass} row(s) passed validation`,
      });
    }
  }

  function onAppend() {
    if (!report) return;
    // Only append PASS + WARN normalized rows
    const good = report.rows
      .filter(r => r.status !== "FAIL")
      .map(r => r.normalized!)
      .map(rowToProduct);

    // Deduplicate by id
    const existing = loadProducts();
    const map = new Map(existing.map(p => [p.id, p]));
    for (const p of good) map.set(p.id, p);
    const merged = Array.from(map.values());
    saveProducts(merged);
    
    toast({
      title: 'Products Added',
      description: `${good.length} product(s) added to catalog`,
    });
    
    // Reset
    setCsvText("");
    setReport(null);
  }

  function rowToProduct(r: any): Product {
    return {
      id: r.id,
      title: r.title,
      image: r.image,
      price: Number(r.price),
      currency: "USD",
      url: r.url,
      brand: r.brand,
      tags: String(r.tags).split(",").filter(Boolean) as AestheticTag[],
      palette: String(r.palette).split(",").filter(Boolean),
      // Store overrides for outbound URL builder
      aff_param_key: r.aff_param_key || undefined,
      aff_param_value: r.aff_param_value || undefined,
      category: r.category || undefined,
    } as any;
  }

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
              Upload your product catalog and create curated decks
            </p>
          </div>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="decks">Decks</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-8">
              {/* Upload Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Products</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="csvFile">Product CSV *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        onChange={onFile}
                        className="flex-1"
                      />
                      <Button onClick={onValidate}>Validate</Button>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Upload CSV with headers: <code className="bg-muted px-1 rounded">{EXPECTED_HEADERS.join(",")}</code></p>
                    </div>
                    
                    <div className="rounded-lg bg-muted p-4 text-sm space-y-2 mt-4">
                      <p className="font-medium">CSV Guide</p>
                      <div className="text-muted-foreground space-y-1">
                        <p><strong>Required:</strong> id, title, image, price, url, brand, tags, palette</p>
                        <p><strong>Optional:</strong> category, aff_param_key, aff_param_value</p>
                        <p><strong>Tags:</strong> {VALID_TAGS.join(", ")}</p>
                        <p><strong>Palette:</strong> comma-separated hex codes like #D3C7B2,#F0EDE6</p>
                        <p className="mt-2 text-xs">We'll normalize tags/palette and let you download a fixed CSV. Only PASS/WARN rows get appended.</p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted p-4 text-sm space-y-2 mt-4">
                      <p className="font-medium">Affiliate Linking</p>
                      <p className="text-muted-foreground">
                        We'll append <code className="bg-background px-1 rounded">?src=aesthetiq&click_id=[id]&deck=[deckId]&utm_source=aesthetiq&utm_medium=referral&utm_campaign=shop_v1</code> and <code className="bg-background px-1 rounded">?aff=[brand]</code> by default.
                      </p>
                      <p className="text-muted-foreground">
                        If your shop needs custom params, include <code className="bg-background px-1 rounded">aff_param_key</code> and <code className="bg-background px-1 rounded">aff_param_value</code> per product in CSV.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {report && <ImportReportView report={report} onAppend={onAppend} />}
            </TabsContent>

            <TabsContent value="decks">
              <DeckBuilder />
            </TabsContent>
          </Tabs>
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
                <div className="space-y-2">
                  {VALID_TAGS.map((tag) => (
                    <Badge key={tag} variant="outline" className="font-mono text-xs mr-1 mb-1">
                      {tag}
                    </Badge>
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
                <li>• id</li>
                <li>• title</li>
                <li>• image (URL)</li>
                <li>• price (number)</li>
                <li>• url (product link)</li>
                <li>• brand</li>
                <li>• tags (comma-separated)</li>
                <li>• palette (hex colors, comma-separated)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Example palette: #D3C7B2,#F0EDE6,#FFFFFF
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default Partners;
