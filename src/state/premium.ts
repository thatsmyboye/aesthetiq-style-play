import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PremiumState {
  isPremium: boolean;
  enablePremium: () => void;
  disablePremium: () => void;
  togglePremium: () => void;
}

export const usePremium = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      
      enablePremium: () => {
        set({ isPremium: true });
      },
      
      disablePremium: () => {
        set({ isPremium: false });
      },
      
      togglePremium: () => {
        set((state) => ({ isPremium: !state.isPremium }));
      },
    }),
    {
      name: 'aesthetiq-premium',
    }
  )
);
