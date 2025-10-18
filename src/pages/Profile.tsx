import { useTasteStore } from '@/state/taste';
import { getAllVisualItems } from '@/data/images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Palette, Tag, Heart, Share2, RotateCcw, TrendingUp } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { getTopTags, generateVibeLabels } from '@/utils/vibeLabels';
import { getFrequentColors } from '@/utils/colorUtils';
import { toast } from '@/hooks/use-toast';
import { useMemo } from 'react';

const Profile = () => {
  const { vector, reset } = useTasteStore();
  const visualItems = useMemo(() => getAllVisualItems(), []);

  // Get recently chosen images (last 8 from palette history)
  const recentChosenIds = vector.palette.length > 0 
    ? visualItems
        .filter((item) => 
          item.palette.some((color) => vector.palette.includes(color))
        )
        .slice(-8)
    : [];

  const handleShare = () => {
    const encoded = encodeURIComponent(JSON.stringify(vector));
    const url = `${window.location.origin}/profile?v=${encoded}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Profile link copied!',
      description: 'Share your aesthetic profile with others',
    });
  };

  const handleReset = () => {
    if (confirm('Reset your entire aesthetic profile? This cannot be undone.')) {
      reset();
      toast({
        title: 'Profile reset',
        description: 'Start swiping to build your aesthetic again',
      });
    }
  };

  if (vector.choices === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center space-y-4 py-12 animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-full bg-secondary/30 flex items-center justify-center">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">No Aesthetic Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start swiping on images in the Play tab to discover your unique aesthetic fingerprint
          </p>
        </div>
      </div>
    );
  }

  // Generate profile data
  const topTags = getTopTags(vector.tags, 8);
  const vibeLabels = generateVibeLabels(vector.tags);
  const frequentColors = getFrequentColors(vector.palette, 12);
  
  // Prepare radar chart data
  const radarData = topTags.map((item) => ({
    tag: item.label,
    value: item.weight,
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold text-foreground">Your Aesthetic Profile</h2>
        <p className="text-muted-foreground">
          Based on {vector.choices} choices • {Math.round(vector.confidence * 100)}% confidence
        </p>
      </div>

      {/* Vibe Descriptors */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Your Aesthetic Vibes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {vibeLabels.map((vibe) => (
              <Badge
                key={vibe}
                variant="secondary"
                className="text-base py-2 px-4 font-medium"
              >
                {vibe}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tag Radar & Palette */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tag Radar Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Tag Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="tag"
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 1]}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Radar
                  name="Preference"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Palette Strip */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
              <Palette className="w-5 h-5 text-accent-foreground" />
            </div>
            <CardTitle className="text-lg">Color Palette</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-6 gap-3">
              {frequentColors.map((color, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className="w-14 h-14 rounded-xl shadow-md border-2 border-background hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Your most loved colors across all choices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Moodboard */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Moodboard</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {recentChosenIds.map((image) => (
            <div
              key={image.id}
              className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <img
                src={image.url}
                alt="Aesthetic choice"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
        {recentChosenIds.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Your moodboard will appear as you make choices
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center pt-4">
        <Button onClick={handleShare} variant="default" size="lg" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Profile
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset & Replay
        </Button>
      </div>
    </div>
  );
};

export default Profile;
