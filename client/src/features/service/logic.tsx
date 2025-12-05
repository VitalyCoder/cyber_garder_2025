import { DEFAULT_COOLING_RULES, type ProductStatus, type UserProfile } from "@/types";

interface CheckResult {
  status: ProductStatus;
  daysToWait: number;
  unlockDate: string;
  aiAdvice: string;
  reason?: string;
}

export const checkProduct = (
  name: string,
  price: number,
  category: string,
  profile: UserProfile
): CheckResult => {
  const today = new Date();

  // заглушка AI логики проверка черного списка
  if (profile.blacklistedCategories.includes(category)) {
    return {
      status: 'BLOCKED',
      daysToWait: 0,
      unlockDate: today.toISOString(),
      aiAdvice: `Категория "${category}" находится в твоем черном списке. Игры — твоя слабость. Сосредоточься на важном.`,
      reason: 'Blacklisted Category'
    };
  }

  let days = 1;
  const rule = DEFAULT_COOLING_RULES.find(r => price >= r.min && price < r.max);
  if (rule) days = rule.days;

  if (profile.useSavings && profile.monthlySavings > 0) {
    const needed = Math.max(0, price - profile.currentSavings); 
    const monthsToSave = Math.ceil(needed / profile.monthlySavings);
    const daysToSave = monthsToSave * 30;
    
    
    days = Math.max(days, daysToSave); 
  }

  const unlockDate = new Date();
  unlockDate.setDate(unlockDate.getDate() + days);

  //  ИИ советы
  const percentOfIncome = Math.round((price / profile.monthlyIncome) * 100);
  const advice = `Это ${percentOfIncome}% твоего месячного дохода. Подожди ${days} дн. За это время эмоции улягутся.`;

  return {
    status: 'COOLING',
    daysToWait: days,
    unlockDate: unlockDate.toISOString(),
    aiAdvice: advice
  };
};