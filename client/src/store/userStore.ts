import {
  blacklistApi,
  coolingRangeApi, 
  usersApi,
  type UserEntity,
  type CreateUserDto,
  type AddCoolingRangeDto 
} from '@/shared/api/api';
import { create } from 'zustand';

export interface UserState extends UserEntity {
  blacklistedCategories?: string[];
}

interface UserStore {
  user: UserState | null;
  isLoading: boolean;
  error: string | null;

  register: (data: CreateUserDto & {
    blacklistedCategories: string[];
    coolingRanges: AddCoolingRangeDto[];
  }) => Promise<void>;

  login: (nickname: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<CreateUserDto>) => Promise<void>;
  isLoggedIn: () => boolean;
  setBlacklistLocal: (categories: string[]) => void;
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
      // 4. Извлекаем coolingRanges из данных формы
      const { blacklistedCategories, coolingRanges, ...userDto } = formData;

      // А. Создаем юзера
      const newUser = await usersApi.create(userDto);

      // Б. Собираем все дополнительные запросы в один массив промисов
      const promises = [];

      // Добавляем черный список
      if (blacklistedCategories && blacklistedCategories.length > 0) {
        promises.push(
          ...blacklistedCategories.map((cat) =>
            blacklistApi.add(newUser.id, { name: cat })
          )
        );
      }

      // 5. Добавляем правила охлаждения (НОВОЕ)
      if (coolingRanges && coolingRanges.length > 0) {
        promises.push(
          ...coolingRanges.map((range) =>
            coolingRangeApi.add(newUser.id, range)
          )
        );
      }

      // Выполняем все запросы параллельно
      await Promise.all(promises);

      // В. Сохраняем в стейт (охлаждение в стейте юзера обычно не храним, только блеклист)
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

      return true;

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

  // === ПРОВЕРКА АВТОРИЗАЦИИ ===
  isLoggedIn: () => {
    return get().user !== null;
  },

  // === Блэк лист (Локально) ===
  setBlacklistLocal: (categories: string[]) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, blacklistedCategories: categories };
      set({ user: updatedUser });
      localStorage.setItem('zen_user', JSON.stringify(updatedUser));
    }
  },
}));