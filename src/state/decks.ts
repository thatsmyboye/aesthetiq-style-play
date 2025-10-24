import type { Deck } from "@/types/deck";

const KEY = "aesthetiq.decks.v1";

export function loadDecks(): Deck[] {
  try { 
    return JSON.parse(localStorage.getItem(KEY) || "[]"); 
  } catch { 
    return []; 
  }
}

export function saveDecks(decks: Deck[]) {
  try { 
    localStorage.setItem(KEY, JSON.stringify(decks)); 
  } catch {}
}

export function upsertDeck(d: Deck) {
  const all = loadDecks();
  const ix = all.findIndex(x => x.id === d.id);
  if (ix >= 0) all[ix] = d; 
  else all.unshift(d);
  saveDecks(all);
  return d;
}

export function getDeck(id: string) {
  return loadDecks().find(d => d.id === id) || null;
}

export function deleteDeck(id: string) {
  const all = loadDecks().filter(d => d.id !== id);
  saveDecks(all);
}
