import { calculateCoolingParams, type CheckResult } from '../../entities/product/lib/cooling-logic';
import { type UserProfile } from '../../entities/user/model/types';
import { api } from './api';

export const checkProductApi = async (
  name: string,
  price: number,
  category: string,
  profile: UserProfile
): Promise<CheckResult> => {
  
  try {
    const { data } = await api.post<CheckResult>('/check', {
      product_name: name,
      price: price,
      category: category,
      user_income: profile.monthlyIncome,
      user_savings: profile.currentSavings
    });

    return data;

  } catch (error) {
    console.warn("Бэкенд (ИИ) недоступен, включаем локальную защиту (Mock)", error);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(calculateCoolingParams(price, category, profile));
      }, 1500);
    });
  }
};