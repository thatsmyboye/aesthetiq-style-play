import type { AestheticTag, VisualItem } from '@/types/domain';

type Obs = Record<AestheticTag, number>;
const KEY = 'aesthetiq.obs.v1';

const init = (tags: AestheticTag[]): Obs =>
  Object.fromEntries(tags.map((t) => [t, 0])) as Obs;

export function loadObs(allTags: AestheticTag[]): Obs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Obs) : init(allTags);
  } catch {
    return init(allTags);
  }
}

export function bumpObs(obs: Obs, items: VisualItem[]) {
  const next = { ...obs };
  for (const it of items) {
    for (const t of it.tags) {
      next[t] = (next[t] ?? 0) + 1;
    }
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}
