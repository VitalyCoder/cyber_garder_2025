export interface IHistoryService {
  add(
    userId: string,
    action: 'bought' | 'cancelled' | 'removed' | 'postponed',
    productName?: string,
    price?: number,
  ): Promise<void>;
  list(userId: string): Promise<
    {
      id: string;
      action: string;
      productName: string | null;
      price: number | null;
      actionDate: Date;
    }[]
  >;
}
