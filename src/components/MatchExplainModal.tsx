import React from "react";
import type { AestheticVector, AestheticTag } from "@/types/domain";
import { explainScore } from "@/state/taste";
import { PREMIUM_MODE } from "@/config/app";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const friendly = (t: string) => t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

interface ProductLike {
  tags: AestheticTag[];
  colors: string[];
  brand: string;
  name?: string;
}

export function MatchExplainModal({
  open,
  onClose,
  product,
  vector,
  recentBrands = [],
}: {
  open: boolean;
  onClose: () => void;
  product: ProductLike;
  vector: AestheticVector;
  recentBrands?: string[];
}) {
  const e = explainScore(
    {
      id: "",
      title: product.name || "",
      image: "",
      price: 0,
      currency: "USD",
      url: "",
      brand: product.brand,
      tags: product.tags,
      palette: product.colors as any,
    },
    vector,
    recentBrands
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Why this matches your vibe</DialogTitle>
        </DialogHeader>

        {PREMIUM_MODE ? (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Overall match score</div>
              <div className="text-3xl font-bold text-primary">{(e.final * 100).toFixed(0)}%</div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Top tag contributions</div>
              <div className="space-y-2">
                {e.tagScoreBreakdown
                  .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                  .slice(0, 5)
                  .map(([tag, w]) => {
                    const normalized = ((w + 1) / 2) * 100; // Convert -1..1 to 0..100
                    return (
                      <div key={tag} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{friendly(tag as string)}</span>
                        <Badge variant={normalized > 50 ? "default" : "outline"}>
                          {Math.max(0, normalized).toFixed(0)}%
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Palette harmony</div>
              <div className="text-sm text-muted-foreground mb-2">
                {Math.round(e.paletteScore * 100)}% color similarity
              </div>
              <div className="flex gap-1.5">
                {product.colors.map((hex) => (
                  <div
                    key={hex}
                    className="h-8 w-8 rounded-md border border-border shadow-sm"
                    style={{ background: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>

            {e.brandAffinity > 0 && (
              <div className="rounded-lg bg-accent/10 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 text-accent-foreground" />
                  Brand familiarity boost
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  +{(e.brandAffinity * 100).toFixed(0)}% for brands you've favorited
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              See full tag contributions, palette breakdown, and brand familiarity insights.
            </p>
            <div className="rounded-xl bg-accent/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
                <p className="font-semibold text-lg">AesthetIQ Premium</p>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground ml-7">
                <li>• Full "Why this match?" details</li>
                <li>• Deeper product recommendations</li>
                <li>• Seasonal Wrapped extras</li>
              </ul>
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  /* open paywall or settings */
                }}
              >
                Upgrade to Premium
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
