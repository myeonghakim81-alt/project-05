import { create } from 'zustand';

import { CURRENT_USER_ID, learnerRepository } from '@/lib/storage';

interface LevelStoreState {
  loaded: boolean;
  currentLevel: number;
  placementCompleted: boolean;
  load: () => Promise<void>;
  setLevel: (currentLevel: number, placementCompleted?: boolean) => Promise<void>;
}

export const useLevelStore = create<LevelStoreState>((set, get) => ({
  loaded: false,
  currentLevel: 1,
  placementCompleted: false,

  load: async () => {
    try {
      const progress = await learnerRepository.getLevelProgress();
      if (progress) {
        set({ currentLevel: progress.currentLevel, placementCompleted: progress.placementCompleted, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch (error) {
      // Same principle as learnerStore: a backend hiccup must not block the
      // app forever — fall back to level 1 / placement not done.
      console.error('Failed to load level progress, starting from level 1:', error);
      set({ loaded: true });
    }
  },

  setLevel: async (currentLevel, placementCompleted) => {
    const next = { currentLevel, placementCompleted: placementCompleted ?? get().placementCompleted };
    set(next);
    await learnerRepository.saveLevelProgress({ userId: CURRENT_USER_ID, ...next });
  },
}));
