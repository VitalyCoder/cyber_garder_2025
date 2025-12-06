export interface UserProfile {
  nickname: string;
  monthlyIncome: number;
  monthlySavings: number;
  currentSavings: number;
  useSavings: boolean;
  blacklistedCategories: string[];
}