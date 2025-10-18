import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteProduct {
  id: string;
  brand: string;
  timestamp: number;
}

interface FavoritesState {
  favorites: FavoriteProduct[];
  addFavorite: (productId: string, brand: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  getRecentBrands: (count?: number) => string[];
  clearFavorites: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (productId: string, brand: string) => {
        set((state) => ({
          favorites: [
            ...state.favorites,
            { id: productId, brand, timestamp: Date.now() },
          ],
        }));
      },
      
      removeFavorite: (productId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== productId),
        }));
      },
      
      isFavorite: (productId: string) => {
        return get().favorites.some((fav) => fav.id === productId);
      },

      getRecentBrands: (count = 8) => {
        const state = get();
        return state.favorites
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, count)
          .map((fav) => fav.brand);
      },
      
      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'aesthetiq-favorites',
    }
  )
);
