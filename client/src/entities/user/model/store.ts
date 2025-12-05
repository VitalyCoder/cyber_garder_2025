import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from './types';

const DEFAULT_PROFILE: UserProfile = {
  nickname: "",
  monthlyIncome: 0,     
  monthlySavings: 0,      
  currentSavings: 0,      
  useSavings: true,           
  blacklistedCategories: ["", ""]
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