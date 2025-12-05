import { COOLING_RULES } from "@/shared/config/constants";
import type { UserProfile } from "@/types";

export type ProductCheckStatus = 'COOLING' | 'BLOCKED';

export interface CheckResult {
  status: ProductCheckStatus;
  daysToWait: number;
  unlockDate: string;
  aiAdvice: string;
}

export const calculateCoolingParams = (
  price: number,
  category: string,
  profile: UserProfile
): CheckResult => {
  const today = new Date();

  //  черный список
  if (profile.blacklistedCategories.includes(category)) {
    return {
      status: 'BLOCKED',
      daysToWait: 0,
      unlockDate: today.toISOString(),
      aiAdvice: `Категория "${category}" находится в твоем черном списке. Игры — твоя слабость. Сосредоточься на важном.`,
    };
  }
  // расчет по цене юзера
  let days = 1;
  const rule = COOLING_RULES.find(r => price >= r.min && price < r.max);
  if (rule) days = rule.days;
// накполения 
  if (profile.useSavings && profile.monthlySavings > 0) {
    const needed = Math.max(0, price - profile.currentSavings);
    const monthsToSave = Math.ceil(needed / profile.monthlySavings);
    const daysToSave = monthsToSave * 30;
    days = Math.max(days, daysToSave);
  }

  // изменить на секунды

  const unlockDate = new Date();
  unlockDate.setDate(unlockDate.getDate() + days);

  const percent = Math.round((price / profile.monthlyIncome) * 100);

  return {
    status: 'COOLING',
    daysToWait: days,
    unlockDate: unlockDate.toISOString(),
    aiAdvice: `Это ${percent}% твоего дохода. Подожди ${days} дн. За это время эмоции улягутся.`,
  };
};