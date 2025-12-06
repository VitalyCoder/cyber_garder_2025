import { create } from 'zustand';
import type { User } from '../types';

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  clearUser: () => void;
  isLoggedIn: () => boolean;
}

const getInitialUser = (): User | null => {
  // try {
  //   const stored = localStorage.getItem('user');
  //   return stored ? JSON.parse(stored) : null;
  // } catch { 
  //   return null;
  // }
  return null
};

export const useUserStore = create<UserStore>((set, get) => ({
  user: getInitialUser(),

  setUser: (user: User) => {
    set({ user });
    localStorage.setItem('user', JSON.stringify(user));
  },

  updateUser: (data: Partial<User>) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...data };
      set({ user: updated });
      localStorage.setItem('user', JSON.stringify(updated));
    }
  },

  clearUser: () => {
    set({ user: null });
    localStorage.removeItem('user');
  },

  isLoggedIn: () => get().user !== null,
}));