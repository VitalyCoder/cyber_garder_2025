import { blacklistApi, type UserEntity, type CreateUserDto, usersApi } from '@/shared/api/api'; // Проверь путь к файлу api/client
import { create } from 'zustand';

export interface UserState extends UserEntity {
  blacklistedCategories?: string[]; 
}

interface UserStore {
  user: UserState | null;
  isLoading: boolean;
  error: string | null;

  register: (data: CreateUserDto & { blacklistedCategories: string[] }) => Promise<void>;
  login: (nickname: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<CreateUserDto>) => Promise<void>;
  isLoggedIn: () => boolean;
}

const getInitialUser = (): UserState | null => {
  try {
    const stored = localStorage.getItem('zen_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useUserStore = create<UserStore>((set, get) => ({
  user: getInitialUser(),
  isLoading: false,
  error: null,

  // === РЕГИСТРАЦИЯ ===
  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const { blacklistedCategories, ...userDto } = formData;

      const newUser = await usersApi.create(userDto);

      if (blacklistedCategories && blacklistedCategories.length > 0) {
        await Promise.all(
          blacklistedCategories.map((cat) =>
            blacklistApi.add(newUser.id, { name: cat })
          )
        );
      }

      const userForState: UserState = {
        ...newUser,
        blacklistedCategories: blacklistedCategories
      };

      set({ user: userForState, isLoading: false });
      localStorage.setItem('zen_user', JSON.stringify(userForState));

    } catch (err) {
      console.error("Ошибка регистрации:", err);
      set({
        isLoading: false,
        error: 'Ошибка регистрации. Возможно, никнейм занят.'
      });
      throw err; 
    }
  },

  // === ВХОД (ЛОГИН) ===
  login: async (nickname: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await usersApi.findByNickname(nickname);

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const blacklist = await blacklistApi.list(user.id);
      const categoryNames = blacklist.map(b => b.name);

      const userForState: UserState = {
        ...user,
        blacklistedCategories: categoryNames
      };

      set({ user: userForState, isLoading: false });
      localStorage.setItem('zen_user', JSON.stringify(userForState));
      
      return true; // Успех

    } catch (err) {
      console.error("Ошибка входа:", err);
      set({
        isLoading: false,
        error: 'Пользователь не найден или ошибка сети.'
      });
      return false;
    }
  },

  // === ОБНОВЛЕНИЕ ===
  updateUser: async (data) => {
    const currentUser = get().user;
    if (!currentUser) return;

    try {
      const updatedUser = await usersApi.update(currentUser.id, data);
      const newState = { ...currentUser, ...updatedUser };

      set({ user: newState });
      localStorage.setItem('zen_user', JSON.stringify(newState));
    } catch (e) {
      console.error("Failed to update user", e);
    }
  },

  // === ВЫХОД ===
  logout: () => {
    set({ user: null });
    localStorage.removeItem('zen_user');
  },

  // === ПРОВЕРКА АВТОРИЗАЦИИ (Добавлено) ===
  isLoggedIn: () => {
    return get().user !== null;
  },
}));