export type WishlistStatus = 'waiting' | 'ready' | 'bought' | 'cancelled';

export interface IWishlistService {
  create(
    userId: string,
    productName: string,
    price: number,
    category: string,
    coolingPeriodDays: number,
    unlockDate?: Date | null,
  ): Promise<{ id: string }>;

  listByUser(userId: string): Promise<
    {
      id: string;
      productName: string;
      price: number;
      category: string;
      coolingPeriodDays: number;
      unlockDate: Date | null;
      status: WishlistStatus;
      aiRecommendation: string | null;
      createdAt: Date;
    }[]
  >;

  updateStatus(id: string, status: WishlistStatus): Promise<void>;
  addAIRecommendation(id: string, recommendation: string): Promise<void>;
  remove(id: string): Promise<void>;
}
