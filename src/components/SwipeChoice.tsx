import { VisualItem } from '@/types/domain';
import { cn } from '@/lib/utils';

interface SwipeChoiceProps {
  itemA: VisualItem;
  itemB: VisualItem;
  onChoose: (chosen: VisualItem, rejected: VisualItem) => void;
  className?: string;
}

const SwipeChoice = ({ itemA, itemB, onChoose, className }: SwipeChoiceProps) => {
  const handleChoose = (chosen: VisualItem, rejected: VisualItem) => {
    onChoose(chosen, rejected);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: Stacked */}
      <div className="md:hidden space-y-4">
        <ChoiceCard
          item={itemA}
          onClick={() => handleChoose(itemA, itemB)}
          label="A"
        />
        
        <div className="flex items-center justify-center py-2">
          <div className="px-4 py-1 bg-muted rounded-full text-sm font-medium text-muted-foreground">
            vs
          </div>
        </div>

        <ChoiceCard
          item={itemB}
          onClick={() => handleChoose(itemB, itemA)}
          label="B"
        />
      </div>

      {/* Desktop: Side by Side */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-6">
        <ChoiceCard
          item={itemA}
          onClick={() => handleChoose(itemA, itemB)}
          label="A"
        />
        <ChoiceCard
          item={itemB}
          onClick={() => handleChoose(itemB, itemA)}
          label="B"
        />
      </div>
    </div>
  );
};

interface ChoiceCardProps {
  item: VisualItem;
  onClick: () => void;
  label: string;
}

const ChoiceCard = ({ item, onClick, label }: ChoiceCardProps) => {
  // Generate accessible alt text from tags
  const altText = `${item.tags.slice(0, 3).join(', ')} aesthetic image`;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full aspect-[3/4] rounded-xl overflow-hidden',
        'shadow-lg hover:shadow-2xl transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'active:scale-[0.98]',
        // Ensure large tap target (min 44x44px)
        'min-h-[44px]'
      )}
      aria-label={`Choose ${label}: ${altText}`}
    >
      {/* Image */}
      <img
        src={item.url}
        alt={altText}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />

      {/* Label Badge */}
      <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md">
        <span className="text-lg font-semibold text-foreground">{label}</span>
      </div>

      {/* Tags */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
        {item.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium"
          >
            {tag.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      {/* Hover Indicator */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default SwipeChoice;
