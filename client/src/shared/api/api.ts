// Центральный модуль запросов клиента: axios-инстанс, типы и функции для всех эндпоинтов
// Основано на контроллерах из server/src/presentation/*

import axios, { type AxiosInstance } from 'axios';

// =========================
// Базовая конфигурация Axios
// =========================
// Предполагаем, что фронт и бэк работают с одним origin через прокси Vite.
// При необходимости можно заменить baseURL на полный адрес API.
// Use Vite env when in browser; fall back to /api in SSR/unknown
const viteEnv =
	(typeof import.meta !== 'undefined' &&
		(import.meta as unknown as { env?: Record<string, string> }).env) ||
	{};
const baseURL =
	typeof window === 'undefined' ? '/api' : viteEnv.VITE_API_BASE_URL ?? '/api';

export const api: AxiosInstance = axios.create({
	baseURL,
});

// Вы можете добавить перехватчики ниже, если нужны единые обработчики ошибок/авторизации
// api.interceptors.response.use(
//   (r) => r,
//   (err) => {
//     // централизованная обработка ошибок
//     return Promise.reject(err);
//   },
// );

// =========================
// Общие типы
// =========================
export type UUID = string;

export type OkResponse = { ok: true };

// =========================
// Типы: Users
// =========================
export interface CreateUserDto {
	nickname: string;
	monthlyIncome?: number;
	monthlySavings?: number;
	currentSavings?: number;
	useSavingsCalculation?: boolean;
}

export interface UpdateUserDto {
	monthlyIncome?: number;
	monthlySavings?: number;
	currentSavings?: number;
	useSavingsCalculation?: boolean;
}

export interface UserEntity extends CreateUserDto {
	id: UUID;
	createdAt: string; // ISO
	updatedAt: string; // ISO
}

// =========================
// Типы: Users Settings
// =========================
export type NotificationFrequency = 'daily' | 'weekly' | 'monthly';
export type NotificationChannel = 'browser' | 'email' | 'telegram';

export interface UpsertUserSettingsDto {
	notificationFrequency?: NotificationFrequency;
	notificationChannel?: NotificationChannel;
}

export interface UserSettingsEntity {
	userId: UUID;
	notificationFrequency: NotificationFrequency;
	notificationChannel: NotificationChannel;
}

// =========================
// Типы: Wishlist
// =========================
export type WishlistStatus = 'waiting' | 'ready' | 'bought' | 'cancelled';

export interface CreateWishlistItemDto {
	productName: string;
	price: number;
	category: string;
	coolingPeriodDays: number;
	unlockDate?: string | null; // ISO
}

export interface UpdateWishlistStatusDto {
	status: WishlistStatus;
}

export interface AddAIRecommendationDto {
	recommendation: string;
}

export interface WishlistItemEntity {
	id: UUID;
	userId: UUID;
	productName: string;
	price: number;
	category: string;
	coolingPeriodDays: number;
	unlockDate: string | null; // ISO
	status: WishlistStatus;
	aiRecommendation?: string | null;
	createdAt: string; // ISO
	updatedAt: string; // ISO
}

// =========================
// Типы: Blacklist
// =========================
export interface AddBlacklistCategoryDto {
	name: string;
}

export interface BlacklistCategoryEntity {
	id: UUID;
	userId: UUID;
	name: string;
	createdAt: string; // ISO
}

export interface ExistsResponse {
	exists: boolean;
}

// =========================
// Типы: Cooling Range
// =========================
export interface AddCoolingRangeDto {
	min: number; // >=0
	max?: number | null; // >=0 или null
	days: number; // >=1
}

export interface CoolingRangeEntity {
	id: UUID;
	userId: UUID;
	min: number;
	max: number | null;
	days: number;
}

// =========================
// Типы: History
// =========================
export type HistoryAction = 'bought' | 'cancelled' | 'removed' | 'postponed';

export interface AddHistoryDto {
	action: HistoryAction;
	productName?: string;
	price?: number;
}

export interface HistoryEntity {
	id: UUID;
	userId: UUID;
	action: HistoryAction;
	productName?: string | null;
	price?: number | null;
	createdAt: string; // ISO
}

// =========================
// Типы: Products (AI-проверка)
// =========================
export type ProductCheckStatus = 'APPROVED' | 'COOLING' | 'BLOCKED';

export interface CheckProductDto {
	userId: UUID;
	productName?: string;
	price?: number;
	category?: string;
	productUrl?: string;
}

export interface CheckProductResponseDto {
	status: ProductCheckStatus;
	cooling_days?: number;
	unlock_date?: string | null; // ISO
	ai_reason?: string | null;
	ai_advice?: string | null;
	can_afford_now?: boolean;
	detected_name?: string;
	detected_price?: number;
	detected_category?: string;
}

// =========================
// Типы: Notification Excluded Product
// =========================
export interface AddNotificationExcludedProductDto {
	productName: string;
	wishlistId?: string;
}

export interface NotificationExcludedProductEntity {
	id: UUID;
	userId: UUID;
	productName: string;
	wishlistId?: string | null;
	createdAt: string; // ISO
}

// =========================
// USERS API
// =========================
export const usersApi = {
	create: async (payload: CreateUserDto) => {
		const { data } = await api.post<UserEntity>('/users', payload);
		return data;
	},
	findById: async (id: UUID) => {
		const { data } = await api.get<UserEntity>(`/users/${id}`);
		return data;
	},
	findByNickname: async (nickname: string) => {
		const { data } = await api.get<UserEntity>(
			`/users/by-nickname/${nickname}`
		);
		return data;
	},
	update: async (id: UUID, payload: UpdateUserDto) => {
		const { data } = await api.patch<UserEntity>(`/users/${id}`, payload);
		return data;
	},
	delete: async (id: UUID) => {
		const { data } = await api.delete<OkResponse>(`/users/${id}`);
		return data;
	},
};

// =========================
// USERS SETTINGS API
// =========================
export const usersSettingsApi = {
	upsert: async (userId: UUID, payload: UpsertUserSettingsDto) => {
		const { data } = await api.put<UserSettingsEntity>(
			`/users/${userId}/settings`,
			payload
		);
		return data;
	},
	get: async (userId: UUID) => {
		const { data } = await api.get<UserSettingsEntity>(
			`/users/${userId}/settings`
		);
		return data;
	},
};

// =========================
// WISHLIST API
// =========================
export const wishlistApi = {
	create: async (userId: UUID, payload: CreateWishlistItemDto) => {
		const { data } = await api.post<WishlistItemEntity>(
			`/users/${userId}/wishlist`,
			payload
		);
		return data;
	},
	list: async (userId: UUID) => {
		const { data } = await api.get<WishlistItemEntity[]>(
			`/users/${userId}/wishlist`
		);
		return data;
	},
	updateStatus: async (
		userId: UUID,
		id: UUID,
		payload: UpdateWishlistStatusDto
	) => {
		const { data } = await api.patch<OkResponse>(
			`/users/${userId}/wishlist/${id}/status`,
			payload
		);
		return data;
	},
	addAIRecommendation: async (
		userId: UUID,
		id: UUID,
		payload: AddAIRecommendationDto
	) => {
		const { data } = await api.patch<OkResponse>(
			`/users/${userId}/wishlist/${id}/ai-recommendation`,
			payload
		);
		return data;
	},
	remove: async (userId: UUID, id: UUID) => {
		const { data } = await api.delete<OkResponse>(
			`/users/${userId}/wishlist/${id}`
		);
		return data;
	},
};

// Внимание: эндпоинты WishlistController используют путь с :userId, но операции update/remove принимают только id.
// Бэк извлекает userId из маршрута; на клиенте можно хранить текущего юзера и подставлять его.
// В маршрутах выше для операций по id мы оставили ":userId" как часть статического пути,
// так как контроллер ожидает этот сегмент. Если на фронте есть текущий userId, можно
// заменить на конкретное значение. Для консистентности добавим вспомогательную версию:
export const wishlistApiWithUser = {
	updateStatus: async (
		userId: UUID,
		id: UUID,
		payload: UpdateWishlistStatusDto
	) => {
		const { data } = await api.patch<OkResponse>(
			`/users/${userId}/wishlist/${id}/status`,
			payload
		);
		return data;
	},
	addAIRecommendation: async (
		userId: UUID,
		id: UUID,
		payload: AddAIRecommendationDto
	) => {
		const { data } = await api.patch<OkResponse>(
			`/users/${userId}/wishlist/${id}/ai-recommendation`,
			payload
		);
		return data;
	},
	remove: async (userId: UUID, id: UUID) => {
		const { data } = await api.delete<OkResponse>(
			`/users/${userId}/wishlist/${id}`
		);
		return data;
	},
};

// =========================
// BLACKLIST API
// =========================
export const blacklistApi = {
	list: async (userId: UUID) => {
		const { data } = await api.get<BlacklistCategoryEntity[]>(
			`/users/${userId}/blacklist`
		);
		return data;
	},
	add: async (userId: UUID, payload: AddBlacklistCategoryDto) => {
		const { data } = await api.post<BlacklistCategoryEntity>(
			`/users/${userId}/blacklist`,
			payload
		);
		return data;
	},
	remove: async (userId: UUID, id: UUID) => {
		const { data } = await api.delete<OkResponse>(
			`/users/${userId}/blacklist/${id}`
		);
		return data;
	},
	exists: async (userId: UUID, name: string) => {
		const { data } = await api.get<ExistsResponse>(
			`/users/${userId}/blacklist/exists`,
			{ params: { name } }
		);
		return data;
	},
};

// =========================
// COOLING RANGE API
// =========================
export const coolingRangeApi = {
	list: async (userId: UUID) => {
		const { data } = await api.get<CoolingRangeEntity[]>(
			`/users/${userId}/cooling-ranges`
		);
		return data;
	},
	add: async (userId: UUID, payload: AddCoolingRangeDto) => {
		const { data } = await api.post<CoolingRangeEntity>(
			`/users/${userId}/cooling-ranges`,
			payload
		);
		return data;
	},
	remove: async (userId: UUID, id: UUID) => {
		const { data } = await api.delete<OkResponse>(
			`/users/${userId}/cooling-ranges/${id}`
		);
		return data;
	},
	find: async (userId: UUID, price: number) => {
		const { data } = await api.get<CoolingRangeEntity | null>(
			`/users/${userId}/cooling-ranges/find`,
			{ params: { price } }
		);
		return data;
	},
};

// =========================
// HISTORY API
// =========================
export const historyApi = {
	add: async (userId: UUID, payload: AddHistoryDto) => {
		const { data } = await api.post<OkResponse>(
			`/users/${userId}/history`,
			payload
		);
		return data;
	},
	list: async (userId: UUID) => {
		const { data } = await api.get<HistoryEntity[]>(`/users/${userId}/history`);
		return data;
	},
};

// =========================
// NOTIFICATION EXCLUDED PRODUCT API
// =========================
export const notificationExcludedProductApi = {
	list: async (userId: UUID) => {
		const { data } = await api.get<NotificationExcludedProductEntity[]>(
			`/users/${userId}/notifications/excluded`
		);
		return data;
	},
	add: async (userId: UUID, payload: AddNotificationExcludedProductDto) => {
		const { data } = await api.post<NotificationExcludedProductEntity>(
			`/users/${userId}/notifications/excluded`,
			payload
		);
		return data;
	},
	remove: async (userId: UUID, id: UUID) => {
		const { data } = await api.delete<OkResponse>(
			`/users/${userId}/notifications/excluded/${id}`
		);
		return data;
	},
	exists: async (userId: UUID, productName: string) => {
		const { data } = await api.get<ExistsResponse>(
			`/users/${userId}/notifications/excluded/exists`,
			{ params: { productName } }
		);
		return data;
	},
};

// =========================
// PRODUCTS API (проверка желаемой покупки)
// =========================
export const productsApi = {
	check: async (payload: CheckProductDto) => {
		const { data } = await api.post<CheckProductResponseDto>(
			`/products/check`,
			payload
		);
		return data;
	},
};

// =========================
// Утилита: построение URL с userId
// =========================
export const withUser = (userId: UUID) => ({
	wishlist: {
		updateStatus: (id: UUID) => `/users/${userId}/wishlist/${id}/status`,
		addAI: (id: UUID) => `/users/${userId}/wishlist/${id}/ai-recommendation`,
		remove: (id: UUID) => `/users/${userId}/wishlist/${id}`,
	},
});
