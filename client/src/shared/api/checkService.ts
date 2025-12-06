import { calculateCoolingParams } from '@/entities/product/lib/cooling-logic';
import type { UserProfile } from '@/entities/user/model/types';
import { api, type CheckProductDto, type CheckProductResponseDto } from './api';

export const checkProductApi = async (
	name: string,
	price: number,
	category: string,
	profile: { id: string }
): Promise<CheckProductResponseDto> => {
	try {
		const payload: CheckProductDto = {
			userId: profile.id,
			productName: name,
			price,
			category,
		};
		const { data } = await api.post<CheckProductResponseDto>(
			'/products/check',
			payload
		);

		return data;
	} catch (error) {
		console.warn(
			'Бэкенд (ИИ) недоступен, включаем локальную защиту (Mock)',
			error
		);

		// Фолбек: локальная логика. Конвертируем результат в формат сервера
		const localProfile: UserProfile = {
			nickname: 'local',
			monthlyIncome: 0,
			monthlySavings: 0,
			currentSavings: 0,
			useSavings: false,
			blacklistedCategories: [],
		};
		const local = calculateCoolingParams(price, category, localProfile);
		return {
			status: local.status === 'BLACKLIST' ? 'BLOCKED' : 'COOLING',
			cooling_days: local.daysToWait,
			unlock_date: local.unlockDate,
			ai_reason: null,
			ai_advice: local.aiAdvice,
			can_afford_now: undefined,
		};
	}
};
