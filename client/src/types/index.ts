export interface CoolingRange {
  from: number;
  to: number;
  days: number;
}

export interface User {
  id?: number; 
  nickname: string;
  monthly_income: number;
  monthly_savings: number;
  current_savings: number;
  use_savings_calculation: boolean;
  blacklist_categories: string[];
  cooling_ranges: CoolingRange[];
  notification_frequency: "daily" | "weekly" | "monthly";
  notification_channel: "browser" | "email" | "telegram";
}

export interface WishlistItem {
  id: number;
  product_name: string;
  price: number;
  category: string;
  cooling_period_days: number;
  unlock_date: string; 
  status: "waiting" | "ready" | "bought" | "cancelled" | "postponed";
  exclude_from_notifications: boolean;
  ai_recommendation?: string;
}