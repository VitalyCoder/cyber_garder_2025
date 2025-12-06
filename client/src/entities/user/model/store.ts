import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from './types';

const DEFAULT_PROFILE: UserProfile = {
  nickname: "Гость",
  monthlyIncome: 100000,     
  monthlySavings: 10000,      
  currentSavings: 50000,      
  useSavings: true,           
  blacklistedCategories: ["Видеоигры", "Азартные игры"] // черный список
};

interface UserState {
  profile: UserProfile; 
  setProfile: (profile: UserProfile) => void;

}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      setProfile: (profile) => set({ profile }),
    }),
    { name: 'zb-user-storage' }
  )
);