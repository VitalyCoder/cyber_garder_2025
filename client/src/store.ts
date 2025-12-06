// src/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, WishlistItem,  } from './types';

interface AppState {
  isOnboarded: boolean;
  profile: UserProfile | null;
  wishlist: WishlistItem[];
  
  setProfile: (profile: UserProfile) => void;
  addToWishlist: (item: WishlistItem) => void;
  updateItemStatus: (id: string, status: WishlistItem['status']) => void;
  removeFromWishlist: (id: string) => void;
  resetApp: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isOnboarded: false,
      profile: null,
      wishlist: [],

      setProfile: (profile) => set({ profile, isOnboarded: true }),
      
      addToWishlist: (item) => set((state) => ({ 
        wishlist: [item, ...state.wishlist] 
      })),

      updateItemStatus: (id, status) => set((state) => ({
        wishlist: state.wishlist.map(item => 
          item.id === id ? { ...item, status } : item
        )
      })),

      removeFromWishlist: (id) => set((state) => ({
        wishlist: state.wishlist.filter(item => item.id !== id)
      })),

      resetApp: () => set({ isOnboarded: false, profile: null, wishlist: [] }),
    }),
    {
      name: 'zenbalance-storage',
    }
  )
);