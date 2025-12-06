import { COOLING_RULES } from "@/shared/config/constants";
import type { User, ApiCheckStatus } from "@/types"; // Импортируем ApiCheckStatus из ваших типов
export interface CheckResult {
  status: ApiCheckStatus; 
  daysToWait: number;
  unlockDate: string;
  aiAdvice: string;
}

export const calculateCoolingParams = (
  price: number,
  category: string,
  profile: User
): CheckResult => {
  const today = new Date();

  if (profile.blacklistedCategories.includes(category)) {
    return {
      status: 'BLACKLIST',
      daysToWait: 0,
      unlockDate: today.toISOString(),
      aiAdvice: `Категория "${category}" находится в твоем черном списке.`,
    };
  }
  let days = 1;
  const rule = COOLING_RULES.find(r => price >= r.min && price < r.max);
  if (rule) days = rule.days;
  if (profile.useSavings && profile.monthlySavings > 0) {
    const needed = Math.max(0, price - profile.currentSavings);
    const monthsToSave = Math.ceil(needed / profile.monthlySavings);
    const daysToSave = monthsToSave * 30;
    days = Math.max(days, daysToSave);
  }

  const unlockDate = new Date();
  unlockDate.setDate(unlockDate.getDate() + days);

  const percent = Math.round((price / profile.monthlyIncome) * 100);
  return {
    status: 'COOLDOWN', 
    daysToWait: days,
    unlockDate: unlockDate.toISOString(),
    aiAdvice: `Это ${percent}% твоего дохода. Подожди ${days} дн. За это время эмоции улягутся.`,
  };
};