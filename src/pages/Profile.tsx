import { useTasteState } from '@/state/tasteState';
import { seedImages } from '@/data/seedImages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Tag, Heart } from 'lucide-react';

const Profile = () => {
  const { preferences, getFingerprint } = useTasteState();
  const fingerprint = getFingerprint();

  const likedImages = seedImages.filter((img) => preferences.likedImages.includes(img.id));

  if (!fingerprint || preferences.likedImages.length === 0) {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold text-foreground">Your Aesthetic</h2>
        <p className="text-muted-foreground">
          Based on {preferences.likedImages.length} images you loved
        </p>
      </div>

      {/* Fingerprint Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Color Harmony</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold mb-4 capitalize">{fingerprint.colorHarmony}</p>
            <div className="flex flex-wrap gap-2">
              {fingerprint.dominantColors.map((color) => (
                <div
                  key={color}
                  className="w-12 h-12 rounded-full shadow-md border-2 border-white"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
              <Tag className="w-5 h-5 text-accent-foreground" />
            </div>
            <CardTitle className="text-lg">Style Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold mb-4 capitalize">{fingerprint.styleProfile}</p>
            <div className="flex flex-wrap gap-2">
              {fingerprint.topTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moodboard */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Moodboard</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {likedImages.map((image) => (
            <div
              key={image.id}
              className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <img
                src={image.url}
                alt="Liked aesthetic"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
