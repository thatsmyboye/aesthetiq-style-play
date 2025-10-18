import { useState } from 'react';
import { useTasteState } from '@/state/tasteState';
import { seedImages } from '@/data/seedImages';
import { Button } from '@/components/ui/button';
import { Heart, X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const Play = () => {
  const { preferences, currentImageIndex, addSwipe, getNextImage, reset } = useTasteState();
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const currentImage = seedImages[currentImageIndex % seedImages.length];
  const swipeCount = preferences.swipeHistory.length;

  const handleSwipe = (liked: boolean) => {
    setSwipeDirection(liked ? 'right' : 'left');

    setTimeout(() => {
      addSwipe({
        imageId: currentImage.id,
        liked,
        timestamp: Date.now(),
      });
      getNextImage();
      setSwipeDirection(null);
    }, 300);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold text-foreground">Discover Your Aesthetic</h2>
          <p className="text-muted-foreground">
            Swipe right on images you love, left on ones you don't
          </p>
          <p className="text-sm text-primary font-medium">{swipeCount} swipes • Keep going!</p>
        </div>

        {/* Swipe Card */}
        <div className="relative aspect-[3/4] max-w-md mx-auto">
          <div
            className={cn(
              'absolute inset-0 rounded-3xl overflow-hidden shadow-xl transition-all duration-300',
              swipeDirection === 'right' && 'translate-x-12 rotate-6 opacity-0',
              swipeDirection === 'left' && '-translate-x-12 -rotate-6 opacity-0'
            )}
          >
            <img
              src={currentImage.url}
              alt="Aesthetic"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex flex-wrap gap-2">
                {currentImage.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 pt-4">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full w-16 h-16 p-0 border-2 hover:border-destructive hover:text-destructive"
            onClick={() => handleSwipe(false)}
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            className="rounded-full w-20 h-20 p-0 bg-primary hover:bg-primary/90"
            onClick={() => handleSwipe(true)}
          >
            <Heart className="w-8 h-8 fill-current" />
          </Button>
        </div>

        {/* Reset Button */}
        {swipeCount > 0 && (
          <div className="text-center pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Play;
