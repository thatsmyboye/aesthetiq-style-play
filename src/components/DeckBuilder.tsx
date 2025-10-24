import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { upsertDeck, loadDecks, deleteDeck } from "@/state/decks";
import { getAllVisualItems } from "@/data/images";
import { products } from "@/data/products";
import type { Deck, DeckSource } from "@/types/deck";
import type { AestheticTag, ColorHex } from "@/types/domain";
import { Upload, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DeckBuilder() {
  const [deckId, setDeckId] = useState("");
  const [title, setTitle] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [source, setSource] = useState<DeckSource>("products");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [palette, setPalette] = useState("");
  const [itemIds, setItemIds] = useState("");
  const [sponsored, setSponsored] = useState(false);
  const [sponsorLabel, setSponsorLabel] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const existingDecks = loadDecks();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      setCsvFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
    }
  };

  const handleParseCSV = async () => {
    if (!csvFile) return;

    const text = await csvFile.text();
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",");

    // Simple CSV parser
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h.trim()] = values[idx]?.trim() || "";
      });

      // Validate
      const deck: Deck = {
        id: row.id || `deck-${Date.now()}-${i}`,
        title: row.title || "",
        creatorId: row.creatorId || "",
        source: (row.source as DeckSource) || "products",
        tags: row.tags ? (row.tags.split(";") as AestheticTag[]) : [],
        palette: row.palette ? (row.palette.split(";") as ColorHex[]) : [],
        itemIds: row.itemIds ? row.itemIds.split(";") : [],
        coverImage: row.coverImage,
        description: row.description,
        sponsored: row.sponsored === "true",
        sponsorLabel: row.sponsorLabel,
        createdAt: new Date().toISOString(),
      };

      // Validate itemIds exist
      const sourceItems = deck.source === "products" ? products : getAllVisualItems();
      const validIds = new Set(sourceItems.map((x) => x.id));
      const invalidIds = deck.itemIds.filter((id) => !validIds.has(id));

      if (invalidIds.length > 0) {
        toast({
          title: "Invalid Items",
          description: `Row ${i}: Invalid item IDs: ${invalidIds.join(", ")}`,
          variant: "destructive",
        });
        continue;
      }

      upsertDeck(deck);
    }

    toast({
      title: "Success",
      description: `${lines.length - 1} deck(s) imported`,
    });

    setCsvFile(null);
  };

  const handleSubmit = () => {
    if (!deckId || !title || !creatorId || !itemIds) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate itemIds
    const sourceItems = source === "products" ? products : getAllVisualItems();
    const validIds = new Set(sourceItems.map((x) => x.id));
    const itemIdArray = itemIds.split(";").map((id) => id.trim());
    const invalidIds = itemIdArray.filter((id) => !validIds.has(id));

    if (invalidIds.length > 0) {
      toast({
        title: "Invalid Items",
        description: `Invalid item IDs: ${invalidIds.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const deck: Deck = {
      id: deckId,
      title,
      creatorId,
      source,
      tags: tags ? (tags.split(",").map((t) => t.trim()) as AestheticTag[]) : [],
      palette: palette ? (palette.split(",").map((p) => p.trim()) as ColorHex[]) : [],
      itemIds: itemIdArray,
      coverImage: coverImage || undefined,
      description: description || undefined,
      sponsored,
      sponsorLabel: sponsored ? sponsorLabel : undefined,
      createdAt: new Date().toISOString(),
    };

    upsertDeck(deck);

    toast({
      title: "Deck Saved",
      description: `"${title}" has been saved`,
    });

    // Reset form
    setDeckId("");
    setTitle("");
    setCreatorId("");
    setDescription("");
    setCoverImage("");
    setTags("");
    setPalette("");
    setItemIds("");
    setSponsored(false);
    setSponsorLabel("");
  };

  const handleDelete = (id: string) => {
    deleteDeck(id);
    toast({
      title: "Deck Deleted",
      description: "The deck has been removed",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Deck</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deckId">Deck ID (slug) *</Label>
              <Input
                id="deckId"
                value={deckId}
                onChange={(e) => setDeckId(e.target.value)}
                placeholder="coastal-calm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Coastal Calm Collection"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creatorId">Creator/Brand ID *</Label>
              <Input
                id="creatorId"
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                placeholder="Seaside Home"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source *</Label>
              <Select value={source} onValueChange={(v) => setSource(v as DeckSource)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="visuals">Visuals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Curated pieces inspired by..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="coastal,organic,neutral_palette"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="palette">Palette (comma-separated hex)</Label>
              <Input
                id="palette"
                value={palette}
                onChange={(e) => setPalette(e.target.value)}
                placeholder="#C8D8C8,#A8B8A8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemIds">Item IDs (semicolon-separated) *</Label>
            <Input
              id="itemIds"
              value={itemIds}
              onChange={(e) => setItemIds(e.target.value)}
              placeholder="prod-001;prod-014;prod-203"
            />
            <p className="text-xs text-muted-foreground">
              Use product IDs from your catalog (e.g., prod-001, prod-002)
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sponsored"
                checked={sponsored}
                onChange={(e) => setSponsored(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="sponsored" className="cursor-pointer">
                Sponsored
              </Label>
            </div>
            {sponsored && (
              <Input
                value={sponsorLabel}
                onChange={(e) => setSponsorLabel(e.target.value)}
                placeholder="Featured Collection"
              />
            )}
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Save Deck
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import from CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>CSV File</Label>
            <div className="flex gap-2">
              <Input type="file" accept=".csv" onChange={handleFileChange} />
              <Button onClick={handleParseCSV} disabled={!csvFile}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Columns: id, title, creatorId, source, tags, palette, itemIds, coverImage,
              description, sponsored, sponsorLabel
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Decks</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {existingDecks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No decks yet</p>
            ) : (
              <div className="space-y-2">
                {existingDecks.map((deck) => (
                  <div
                    key={deck.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{deck.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {deck.creatorId} • {deck.itemIds.length} items
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(deck.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
