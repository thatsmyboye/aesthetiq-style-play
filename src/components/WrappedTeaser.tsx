import { useState, useRef } from 'react';
import { AestheticVector, AestheticTag } from '@/types/domain';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, Share2, Download, Copy, TrendingUp } from 'lucide-react';
import { getTopTags, generateVibeLabels, TAG_LABELS } from '@/utils/vibeLabels';
import { getFrequentColors } from '@/utils/colorUtils';
import { renderToPNG, downloadBlob, copyBlobToClipboard } from '@/utils/share';
import { toast } from '@/hooks/use-toast';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface WrappedTeaserProps {
  vector: AestheticVector;
}

const WrappedTeaser = ({ vector }: WrappedTeaserProps) => {
  const [showModal, setShowModal] = useState(false);
  const wrappedRef = useRef<HTMLDivElement>(null);

  if (vector.choices < 60) {
    return null;
  }

  const vibeLabels = generateVibeLabels(vector.tags);
  const topTags = getTopTags(vector.tags, 8);
  const top3Tags = topTags.slice(0, 3);
  const frequentColors = getFrequentColors(vector.palette, 8);

  const radarData = topTags.map((item) => ({
    tag: item.label,
    value: Math.round(item.weight * 100),
  }));

  // Simple sparkline data - simulate confidence growth
  const sparklinePoints = Array.from({ length: 10 }, (_, i) => {
    const progress = (i + 1) / 10;
    return Math.min(vector.confidence, progress);
  });

  const handleShare = async (action: 'download' | 'copy') => {
    if (!wrappedRef.current) return;

    try {
      const blob = await renderToPNG(wrappedRef.current);

      if (action === 'download') {
        downloadBlob(blob, 'my-2025-wrapped.png');
        toast({
          title: 'Downloaded!',
          description: 'Your Wrapped image has been saved',
        });
      } else {
        const success = await copyBlobToClipboard(blob);
        if (success) {
          toast({
            title: 'Copied!',
            description: 'Image copied to clipboard',
          });
        } else {
          toast({
            title: 'Copy Failed',
            description: 'Try downloading instead',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate image',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Banner */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 animate-fade-in">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-2xl font-semibold text-foreground">
                  Your 2025 Vibe
                </h3>
                <p className="text-lg text-primary font-medium">
                  {vibeLabels[0] || 'Unique Aesthetic'}
                  {vibeLabels[1] ? ` + ${vibeLabels[1]}` : ''}
                </p>
              </div>

              {/* Mini Trend */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Confidence: {Math.round(vector.confidence * 100)}%</span>
                </div>
                <svg width="80" height="20" className="opacity-70">
                  <polyline
                    points={sparklinePoints
                      .map((y, i) => `${i * 8},${20 - y * 18}`)
                      .join(' ')}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-primary"
                  />
                </svg>
              </div>

              {/* Top 3 Tags */}
              <div className="flex flex-wrap gap-2">
                {top3Tags.map((item) => (
                  <Badge key={item.tag} variant="secondary">
                    {item.label}
                  </Badge>
                ))}
              </div>

              <Button onClick={() => setShowModal(true)} size="lg" className="w-full sm:w-auto">
                <Sparkles className="w-4 h-4 mr-2" />
                See Full Wrapped
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your 2025 Aesthetic Wrapped</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Share Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleShare('download')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={() => handleShare('copy')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Image
              </Button>
            </div>

            {/* Wrapped Card (to be exported) */}
            <div
              ref={wrappedRef}
              className="bg-gradient-to-br from-background to-accent/10 p-8 space-y-6 rounded-lg border-2"
            >
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold text-foreground">
                    2025 Wrapped
                  </h2>
                </div>
                <p className="text-xl font-semibold text-primary">
                  {vibeLabels.join(' • ')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {vector.choices} aesthetic choices
                </p>
              </div>

              {/* Radar Chart */}
              <div className="bg-background/50 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="tag"
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Radar
                      name="Aesthetic"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Palette */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground text-center">
                  Your Color Palette
                </h3>
                <div className="flex justify-center gap-2">
                  {frequentColors.map((color) => (
                    <div
                      key={color}
                      className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Top Tags */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground text-center">
                  Top Aesthetic Tags
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {topTags.slice(0, 6).map((item) => (
                    <Badge key={item.tag} variant="secondary" className="text-sm">
                      {item.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                aesthetiq.app • Discover your aesthetic
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WrappedTeaser;
