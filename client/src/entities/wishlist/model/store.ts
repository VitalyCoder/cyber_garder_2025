import { create } from 'zustand';
import { historyApi, wishlistApi, type WishlistItemEntity, type CreateWishlistItemDto } from '@/shared/api/api';

interface WishlistStore {
  items: WishlistItemEntity[];
  isLoading: boolean;
  error: string | null;

  fetchItems: (userId: string) => Promise<void>;
  addItem: (userId: string, item: CreateWishlistItemDto) => Promise<void>;
  deleteItem: (userId: string, id: string) => Promise<void>;
  buyItem: (userId: string, item: WishlistItemEntity) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  buyItem: async (userId, item) => {
    try {
      await historyApi.add(userId, {
        action: 'bought',
        productName: item.productName,
        price: item.price
      });
      await wishlistApi.remove(userId, item.id);
      set((state) => ({
        items: state.items.filter((i) => i.id !== item.id)
      }));
    } catch (error) {
      console.error("Ошибка покупки:", error);
      alert("Не удалось завершить покупку");
    }
  },
  fetchItems: async (userId) => {
    set({ isLoading: true });
    try {
      const data = await wishlistApi.list(userId);
      set({ items: data, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false, error: 'Не удалось загрузить список' });
    }
  },

  addItem: async (userId, payload) => {
    set({ isLoading: true });
    try {
      await wishlistApi.create(userId, payload);
      await get().fetchItems(userId);
    } catch (error) {
      console.error(error);
      set({ isLoading: false, error: 'Ошибка при добавлении' });
      throw error;
    }
  },

  deleteItem: async (userId, id) => {
    try {
      await wishlistApi.remove(userId, id);
      set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      }));
    } catch (error) {
      console.error(error);
    }
  }
}));