// Maximal Marginal Relevance (MMR)
export function mmr<T>({
  candidates,              // sorted by relevance descending
  k,                        // diversify top-k
  lambda = 0.75,           // relevance vs diversity
  relevance,               // (x:T) => number  (higher is better)
  similarity               // (a:T,b:T) => number in [0..1]
}: {
  candidates: T[];
  k: number;
  lambda?: number;
  relevance: (x:T)=>number;
  similarity: (a:T,b:T)=>number;
}): T[] {
  if (!candidates.length || k <= 0) return candidates;
  const selected: T[] = [];
  const pool = [...candidates];

  while (selected.length < Math.min(k, pool.length)) {
    let bestIdx = 0, bestScore = -Infinity;
    for (let i = 0; i < pool.length; i++) {
      const x = pool[i];
      const rel = relevance(x);
      const red = selected.length
        ? Math.max(...selected.map(s => similarity(x, s)))
        : 0;
      const score = lambda * rel - (1 - lambda) * red;
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
    selected.push(pool.splice(bestIdx, 1)[0]);
  }
  // Keep diversified selection first, then the remainder in original order
  return selected.concat(pool);
}
