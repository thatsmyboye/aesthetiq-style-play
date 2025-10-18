import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPreferences, SwipeAction, AestheticFingerprint } from '@/types';
import { calculateFingerprint } from '@/utils/aestheticAnalysis';
import { seedImages } from '@/data/seedImages';

interface TasteState {
  preferences: UserPreferences;
  currentImageIndex: number;
  addSwipe: (action: SwipeAction) => void;
  getNextImage: () => void;
  getFingerprint: () => AestheticFingerprint | undefined;
  reset: () => void;
}

const initialState: UserPreferences = {
  likedImages: [],
  dislikedImages: [],
  swipeHistory: [],
};

export const useTasteState = create<TasteState>()(
  persist(
    (set, get) => ({
      preferences: initialState,
      currentImageIndex: 0,

      addSwipe: (action: SwipeAction) => {
        set((state) => {
          const newLiked = action.liked 
            ? [...state.preferences.likedImages, action.imageId]
            : state.preferences.likedImages;
          
          const newDisliked = !action.liked
            ? [...state.preferences.dislikedImages, action.imageId]
            : state.preferences.dislikedImages;

          const newHistory = [...state.preferences.swipeHistory, action];

          // Calculate fingerprint after every 5 swipes
          const fingerprint = newHistory.length % 5 === 0 
            ? calculateFingerprint(newLiked, seedImages)
            : state.preferences.fingerprint;

          return {
            preferences: {
              likedImages: newLiked,
              dislikedImages: newDisliked,
              swipeHistory: newHistory,
              fingerprint,
            },
          };
        });
      },

      getNextImage: () => {
        set((state) => ({
          currentImageIndex: state.currentImageIndex + 1,
        }));
      },

      getFingerprint: () => {
        const state = get();
        if (!state.preferences.fingerprint && state.preferences.likedImages.length > 0) {
          const fingerprint = calculateFingerprint(state.preferences.likedImages, seedImages);
          set((s) => ({
            preferences: { ...s.preferences, fingerprint },
          }));
          return fingerprint;
        }
        return state.preferences.fingerprint;
      },

      reset: () => {
        set({
          preferences: initialState,
          currentImageIndex: 0,
        });
      },
    }),
    {
      name: 'aesthetiq-taste',
    }
  )
);
