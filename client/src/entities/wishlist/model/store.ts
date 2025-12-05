import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WishlistStatus = 'COOLING' | 'READY' | 'BOUGHT' | 'BLOCKED';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  category: string;
  status: WishlistStatus;
  unlockDate: string;
  aiAdvice: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  updateStatus: (id: string, status: WishlistStatus) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
      updateStatus: (id, status) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, status } : i)
      })),
    }),
    { name: 'zb-wishlist-storage' }
  )
);