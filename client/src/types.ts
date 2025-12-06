export interface User {
  id?: string; 
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

export type WishlistStatus = ProductStatus;
export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  category: string;
  status: ProductStatus;
  unlockDate?: string;
  aiAdvice?: string;
  createdAt: string;  
  excludeFromNotifications: boolean;
}



export const CATEGORIES = [
  "Электроника и техника", 
  "Одежда и обувь",
  "Видеоигры", 
  "Развлечения", 
  "Красота", 
  "Супермаркеты",
  "Фастфуд",
  "Рестораны и кафе",
  "Такси и Транспорт", 
  "Аптеки",
  "Дом и ремонт",
  "Автоуслуги", 
  "Подарки и Цветы",
  "Образование", 
  "Спорттовары",
  "Подписки и Сервисы", 
  "Другое"
];


export type ApiCheckStatus = "APPROVED" | "COOLDOWN" | "BLACKLIST";

export const mapApiStatusToProductStatus = (
  status: ApiCheckStatus
): ProductStatus => {
  switch (status) {
    case "APPROVED":
      return "READY";
    case "COOLDOWN":
      return "COOLING";
    case "BLACKLIST":
      return "BLOCKED";
    default:
      return "CANCELLED";
  }
};