export interface UserProfile {
  nickname: string;
  monthlyIncome: number;
  monthlySavings: number;
  currentSavings: number;
  useSavings: boolean; 
  blacklistedCategories: string[];
}

export interface CoolingRule {
  min: number;
  max: number;
  days: number;
}

export const DEFAULT_COOLING_RULES: CoolingRule[] = [
  { min: 0, max: 15000, days: 1 },
  { min: 15000, max: 50000, days: 7 },
  { min: 50000, max: 100000, days: 30 },
  { min: 100000, max: 200000, days: 60 },
  { min: 200000, max: Infinity, days: 90 },
];

export type ProductStatus = 'COOLING' | 'BLOCKED' | 'READY' | 'BOUGHT' | 'CANCELLED';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  category: string;
  status: ProductStatus;
  createdAt: string;
  unlockDate?: string;
  aiAdvice?: string;
}

export const CATEGORIES = [
  "Техника",
  "Видеоигры",
  "Косметика",
  "Еда",
  "Развлечения",
  "Одежда",
  "Другое"
];