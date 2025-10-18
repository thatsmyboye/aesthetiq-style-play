import { useState, useEffect, useMemo } from 'react';
import { useTasteStore } from '@/state/taste';
import { getAllVisualItems } from '@/data/images';
import { createPairGenerator } from '@/utils/pairs';
import { VisualItem } from '@/types/domain';
import SwipeChoice from '@/components/SwipeChoice';
import { Button } from '@/components/ui/button';
import { RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Play = () => {
  const { vector, choose, reset } = useTasteStore();
  const visualItems = useMemo(() => getAllVisualItems(), []);
  const [currentPair, setCurrentPair] = useState<[VisualItem, VisualItem] | null>(null);
  const [history, setHistory] = useState<Array<{ chosen: VisualItem; rejected: VisualItem }>>([]);

  // Create pair generator (memoized)
  const pairGenerator = useMemo(() => createPairGenerator(visualItems), []);

  // Load initial pair
  useEffect(() => {
    loadNextPair();
  }, []);

  // Show toast at milestone
  useEffect(() => {
    if (vector.choices === 12) {
      toast.success('Your aesthetic is emerging…', {
        description: 'Keep going to refine your taste profile!',
        duration: 4000,
      });
    }
    if (vector.choices === 30) {
      toast.success('Taste profile developing nicely!', {
        description: 'Just 30 more choices to reach full confidence.',
        duration: 4000,
      });
    }
    if (vector.choices === 60) {
      toast.success('🎉 Aesthetic mastery achieved!', {
        description: 'Your taste profile is fully calibrated.',
        duration: 5000,
      });
    }
  }, [vector.choices]);

  const loadNextPair = () => {
    const pair = pairGenerator.getNext();
    if (pair) {
      setCurrentPair(pair);
    }
  };

  const handleChoose = (chosen: VisualItem, rejected: VisualItem) => {
    // Update taste vector
    choose(chosen, rejected);

    // Add to history
    setHistory((prev) => [...prev, { chosen, rejected }]);

    // Load next pair with slight delay for smoother UX
    setTimeout(() => {
      loadNextPair();
    }, 150);
  };

  const handleSkip = () => {
    loadNextPair();
    toast.info('Pair skipped', { duration: 2000 });
  };

  const handleUndo = () => {
    if (history.length === 0) {
      toast.error('Nothing to undo', { duration: 2000 });
      return;
    }

    // Remove last entry from history
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);

    // Note: We don't reverse the taste vector as that would be complex
    // In a production app, you'd store reverse operations
    toast.success('Last choice removed from history', { duration: 2000 });
    loadNextPair();
  };

  const handleReset = () => {
    reset();
    setHistory([]);
    pairGenerator.reset();
    loadNextPair();
    toast.success('Taste profile reset', { duration: 2000 });
  };

  const confidencePercent = Math.round(vector.confidence * 100);

  if (!currentPair) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center space-y-4 py-12">
          <div className="text-muted-foreground">Loading choices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          Which aesthetic speaks to you?
        </h2>
        <p className="text-muted-foreground">
          Choose your favorite to build your taste profile
        </p>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-foreground">{vector.choices} choices</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="text-sm font-medium">
            <span className="text-primary">{confidencePercent}%</span>
            <span className="text-muted-foreground ml-1">confidence</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Swipe Choice */}
      <SwipeChoice
        itemA={currentPair[0]}
        itemB={currentPair[1]}
        onChoose={handleChoose}
        className="animate-scale-in"
      />

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip
        </Button>

        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Undo
          </Button>
        )}

        {vector.choices > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
        )}
      </div>
    </div>
  );
};

export default Play;
