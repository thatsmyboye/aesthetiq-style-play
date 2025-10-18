import { VisualItem } from '@/types/domain';

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Manages non-repeating pairs with rolling window
 */
export class PairGenerator {
  private items: VisualItem[];
  private shuffledItems: VisualItem[];
  private currentIndex: number;
  private recentItems: Set<string>;
  private readonly windowSize: number;

  constructor(items: VisualItem[], windowSize: number = 8) {
    this.items = items;
    this.shuffledItems = shuffle(items);
    this.currentIndex = 0;
    this.recentItems = new Set();
    this.windowSize = windowSize;
  }

  /**
   * Get next pair of items
   */
  getNext(): [VisualItem, VisualItem] | null {
    // If we're near the end, reshuffle
    if (this.currentIndex >= this.shuffledItems.length - 1) {
      this.reshuffle();
    }

    // Get two items that aren't in recent window
    const first = this.getNextItem();
    const second = this.getNextItem();

    if (!first || !second) {
      return null;
    }

    // Add to recent window
    this.addToRecent(first.id);
    this.addToRecent(second.id);

    return [first, second];
  }

  /**
   * Get next item not in recent window
   */
  private getNextItem(): VisualItem | null {
    let attempts = 0;
    const maxAttempts = this.shuffledItems.length;

    while (attempts < maxAttempts) {
      if (this.currentIndex >= this.shuffledItems.length) {
        this.reshuffle();
      }

      const item = this.shuffledItems[this.currentIndex];
      this.currentIndex++;

      // Check if item is not in recent window
      if (!this.recentItems.has(item.id)) {
        return item;
      }

      attempts++;
    }

    // Fallback: return any item if all attempts failed
    return this.shuffledItems[this.currentIndex - 1] || null;
  }

  /**
   * Add item to recent window, maintaining size limit
   */
  private addToRecent(id: string): void {
    this.recentItems.add(id);
    
    // Maintain window size
    if (this.recentItems.size > this.windowSize) {
      const firstItem = Array.from(this.recentItems)[0];
      this.recentItems.delete(firstItem);
    }
  }

  /**
   * Reshuffle the items and reset index
   */
  private reshuffle(): void {
    this.shuffledItems = shuffle(this.items);
    this.currentIndex = 0;
  }

  /**
   * Peek at the next pair without consuming it
   */
  peek(): [VisualItem, VisualItem] | null {
    const savedIndex = this.currentIndex;
    const savedRecent = new Set(this.recentItems);

    // Temporarily get next pair
    const pair = this.getNext();

    // Restore state
    this.currentIndex = savedIndex;
    this.recentItems = savedRecent;

    return pair;
  }

  /**
   * Reset the generator
   */
  reset(): void {
    this.shuffledItems = shuffle(this.items);
    this.currentIndex = 0;
    this.recentItems.clear();
  }
}

/**
 * Create a pair generator instance
 */
export function createPairGenerator(items: VisualItem[]): PairGenerator {
  return new PairGenerator(items);
}
