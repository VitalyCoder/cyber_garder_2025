export interface INotificationExcludedProductService {
  list(
    userId: string,
  ): Promise<{ id: string; productName: string; wishlistId: string | null }[]>;
  add(
    userId: string,
    productName: string,
    wishlistId?: string,
  ): Promise<{ id: string }>;
  remove(id: string): Promise<void>;
  exists(userId: string, productName: string): Promise<boolean>;
}
