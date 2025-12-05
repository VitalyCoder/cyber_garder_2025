import { CoolingRange } from '@prisma/client';

export interface ICoolingRangeService {
  list(userId: string): Promise<CoolingRange[]>;
  add(
    userId: string,
    min: number,
    max: number | null,
    days: number,
  ): Promise<CoolingRange>;
  remove(id: string): Promise<void>;
  findForPrice(userId: string, price: number): Promise<CoolingRange | null>;
}
