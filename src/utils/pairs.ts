import { VisualItem, AestheticVector, AestheticTag } from '@/types/domain';
import { OPPOSITES, uncertaintyScore } from '@/utils/aesthetic';

const EPSILON = 0.20; // 20% explore

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

/**
 * Smart pair selection with epsilon-greedy exploration
 */
export function getNextPairSmart(
  allItems: VisualItem[],
  vector: AestheticVector,
  obs: Record<AestheticTag, number>,
  recentIds: string[] // last 10–20 shown, to avoid repeats
): [VisualItem, VisualItem] {
  const explore = Math.random() < EPSILON;
  return explore
    ? pickExplorePair(allItems, vector, obs, recentIds)
    : pickExploitPair(allItems, recentIds);
}

/**
 * EXPLOIT: curated pair with good contrast
 */
function pickExploitPair(
  items: VisualItem[],
  recent: string[]
): [VisualItem, VisualItem] {
  const pool = items.filter((i) => !recent.includes(i.id));
  const a = pool[Math.floor(Math.random() * pool.length)];
  let b = pool[Math.floor(Math.random() * pool.length)];
  let tries = 0;
  while ((b.id === a.id || sharesManyTags(a, b)) && tries++ < 20) {
    b = pool[Math.floor(Math.random() * pool.length)];
  }
  return [a, b];
}

function sharesManyTags(a: VisualItem, b: VisualItem) {
  const s = new Set(a.tags);
  return (
    b.tags.filter((t) => s.has(t)).length >=
    Math.ceil(Math.min(a.tags.length, b.tags.length) / 2)
  );
}

/**
 * EXPLORE: target uncertain + under-exposed tags with an opposite contrast
 */
function pickExplorePair(
  items: VisualItem[],
  v: AestheticVector,
  obs: Record<AestheticTag, number>,
  recent: string[]
): [VisualItem, VisualItem] {
  // 1) score tags by uncertainty
  const scored = Object.entries(v.tags)
    .map(([t, w]) => ({
      t: t as AestheticTag,
      u: uncertaintyScore(w, obs[t as AestheticTag] ?? 0),
    }))
    .sort((a, b) => b.u - a.u);

  // 2) pick top target tag (among those we can actually serve)
  const candidateTag = scored.find((s) => hasTagAvailable(items, s.t, recent));
  const t = candidateTag?.t;
  if (!t) return pickExploitPair(items, recent);

  // 3) find opposite tag if any
  const opp = OPPOSITES[t];

  // 4) choose one item with target tag, one with opposite (or simply without target)
  const pool = items.filter((i) => !recent.includes(i.id));
  const withT = pool.filter((i) => i.tags.includes(t));
  const a = withT[Math.floor(Math.random() * withT.length)];
  if (!a) return pickExploitPair(items, recent);

  let bPool = opp
    ? pool.filter((i) => i.tags.includes(opp))
    : pool.filter((i) => !i.tags.includes(t));
  if (!bPool.length) bPool = pool.filter((i) => !i.tags.includes(t));
  let b = bPool[Math.floor(Math.random() * bPool.length)];
  let tries = 0;
  while (b && (b.id === a.id || sharesManyTags(a, b)) && tries++ < 20) {
    b = bPool[Math.floor(Math.random() * bPool.length)];
  }

  return b ? [a, b] : pickExploitPair(items, recent);
}

function hasTagAvailable(
  items: VisualItem[],
  tag: AestheticTag,
  recent: string[]
) {
  return items.some((i) => i.tags.includes(tag) && !recent.includes(i.id));
}
