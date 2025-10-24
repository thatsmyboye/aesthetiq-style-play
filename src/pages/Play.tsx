import { useState, useEffect, useMemo } from 'react';
import { useTasteStore, shouldCalibrate, markCalibrationDone } from '@/state/taste';
import { getAllVisualItems } from '@/data/images';
import { calibrationPairs } from '@/data/calibration';
import { getNextPairSmart } from '@/utils/pairs';
import { loadObs, bumpObs } from '@/state/observations';
import { trackChoiceMilestone } from '@/utils/tracking';
import { VisualItem, AestheticTag } from '@/types/domain';
import SwipeChoice from '@/components/SwipeChoice';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, SkipForward, Sparkles, Play as PlayIcon, Target } from 'lucide-react';
import { toast } from 'sonner';

const Play = () => {
  const { vector, choose, reset } = useTasteStore();
  const visualItems = useMemo(() => getAllVisualItems(), []);
  const [currentPair, setCurrentPair] = useState<[VisualItem, VisualItem] | null>(null);
  const [history, setHistory] = useState<Array<{ chosen: VisualItem; rejected: VisualItem }>>([]);
  
  // Calibration state
  const [isCalibrating, setIsCalibrating] = useState(shouldCalibrate());
  const [calibrationIndex, setCalibrationIndex] = useState(0);

  // Observations & recent items for smart pair selection
  const [obs, setObs] = useState(() => loadObs(Object.keys(vector.tags) as AestheticTag[]));
  const [recent, setRecent] = useState<string[]>([]);

  // Load initial pair
  useEffect(() => {
    loadInitialPair();
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

  const loadInitialPair = () => {
    if (isCalibrating) {
      setCurrentPair(calibrationPairs[0]);
      // Prefetch next calibration pair
      if (calibrationPairs[1]) {
        [calibrationPairs[1][0].url, calibrationPairs[1][1].url].forEach((url) => {
          const img = new Image();
          img.src = url;
        });
      }
    } else {
      loadNextPair();
    }
  };

  const loadNextPair = () => {
    // Use smart epsilon-greedy selection
    const pair = getNextPairSmart(visualItems, vector, obs, recent);
    setCurrentPair(pair);
    
    // Track recent items to avoid repeats
    setRecent((r) => [pair[0].id, pair[1].id, ...r].slice(0, 20));
    
    // Prefetch next potential pair (explore mode approximation)
    setTimeout(() => {
      const nextPair = getNextPairSmart(visualItems, vector, obs, recent);
      [nextPair[0].url, nextPair[1].url].forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }, 100);
  };

  const handleChoose = (chosen: VisualItem, rejected: VisualItem) => {
    // Update taste vector
    choose(chosen, rejected);

    // Track exposure counts for exploration
    setObs((prevObs) => bumpObs(prevObs, [chosen, rejected]));

    // Track milestone
    trackChoiceMilestone(vector.choices + 1);

    // Add to history
    setHistory((prev) => [...prev, { chosen, rejected }]);

    // Handle calibration flow
    if (isCalibrating) {
      const nextIndex = calibrationIndex + 1;
      
      if (nextIndex < calibrationPairs.length) {
        // Move to next calibration pair
        setCalibrationIndex(nextIndex);
        setTimeout(() => {
          setCurrentPair(calibrationPairs[nextIndex]);
          
          // Prefetch next calibration pair
          if (calibrationPairs[nextIndex + 1]) {
            [calibrationPairs[nextIndex + 1][0].url, calibrationPairs[nextIndex + 1][1].url].forEach((url) => {
              const img = new Image();
              img.src = url;
            });
          }
        }, 150);
      } else {
        // Calibration complete
        markCalibrationDone();
        setIsCalibrating(false);
        setCalibrationIndex(0);
        
        toast.success('Calibration complete!', {
          description: 'Your taste profile is taking shape. Keep exploring!',
          duration: 4000,
        });
        
        setTimeout(() => {
          loadNextPair();
        }, 150);
      }
    } else {
      // Normal play mode
      setTimeout(() => {
        loadNextPair();
      }, 150);
    }
  };

  const handleSkip = () => {
    // Can't skip during calibration
    if (isCalibrating) {
      toast.info('Please complete calibration first', { duration: 2000 });
      return;
    }
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
    setRecent([]);
    setObs(loadObs(Object.keys(vector.tags) as AestheticTag[]));
    loadNextPair();
    toast.success('Taste profile reset', { duration: 2000 });
  };

  const confidencePercent = Math.round(vector.confidence * 100);

  if (!currentPair) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center space-y-6 py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <PlayIcon className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Ready to discover your aesthetic?</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              Tap what feels right.
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We'll show you pairs of images. Choose the one that resonates with you, and we'll learn your unique style.
            </p>
          </div>
          <Button size="lg" onClick={loadNextPair} className="mt-4">
            <PlayIcon className="w-4 h-4 mr-2" />
            Start Discovering
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        {/* Calibration Badge */}
        {isCalibrating && (
          <div className="flex justify-center mb-2">
            <Badge variant="secondary" className="gap-2">
              <Target className="w-3 h-3" />
              Calibration {calibrationIndex + 1} of {calibrationPairs.length}
            </Badge>
          </div>
        )}

        <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
          {isCalibrating ? 'Finding your vibe...' : 'Which aesthetic speaks to you?'}
        </h2>
        <p className="text-muted-foreground">
          {isCalibrating 
            ? 'Choose your favorite from each pair to calibrate your taste profile'
            : 'Choose your favorite to build your taste profile'
          }
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
        {!isCalibrating && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip
          </Button>
        )}

        {!isCalibrating && history.length > 0 && (
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

        {!isCalibrating && vector.choices > 0 && (
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
