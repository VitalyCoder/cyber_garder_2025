import { Injectable } from '@nestjs/common';
import { BlacklistService } from 'src/use-cases/blacklist/blacklist.service';
import { CoolingRangeService } from 'src/use-cases/cooling-range/coolingRange.service';
import { UsersService } from 'src/use-cases/users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly users: UsersService,
    private readonly blacklist: BlacklistService,
    private readonly ranges: CoolingRangeService,
  ) {}

  /**
   * Core check logic without external AI. Returns status and computed cooling days.
   */
  async checkProduct(params: {
    userId: string;
    productName: string;
    price: number;
    category: string;
  }): Promise<{
    status: 'APPROVED' | 'COOLING' | 'BLOCKED';
    coolingDays?: number;
    unlockDate?: Date | null;
    canAffordNow?: boolean;
    aiReason?: string | null;
    aiAdvice?: string | null;
  }> {
    const { userId, price, category } = params;

    // 1) Check blacklist direct match (synonymization can be added later)
    const blocked = await this.blacklist.exists(userId, category);
    if (blocked) {
      return {
        status: 'BLOCKED',
        aiReason: `Категория "${category}" находится в чёрном списке пользователя`,
        aiAdvice: null,
        canAffordNow: false,
        unlockDate: null,
      };
    }

    // 2) Cooling period by price range
    const range = await this.ranges.findForPrice(userId, price);
    const coolingDaysByPrice = range?.days ?? 0;

    // 3) User savings rule (useSavingsCalculation)
    const user = await this.users.findById(userId);
    const canAffordNow = (user?.currentSavings ?? 0) >= price;

    let finalCoolingDays = coolingDaysByPrice;
    if (user?.useSavingsCalculation) {
      const monthlySavings = user?.monthlySavings ?? 0;
      // ТЗ: "половина от месячного объёма" — добавим дополнительный период ожидания,
      // если требуется накопить существенную часть суммы.
      // Пример эвристики: сколько месяцев нужно, чтобы накопить половину цены.
      const halfPrice = Math.floor(price / 2);
      const monthsToHalf =
        monthlySavings > 0 ? Math.ceil(halfPrice / monthlySavings) : 0;
      const daysToAffordHalf = monthsToHalf * 30; // грубо, без календаря
      finalCoolingDays = Math.max(coolingDaysByPrice, daysToAffordHalf);
    }

    // 4) Determine status
    if (finalCoolingDays <= 0 && canAffordNow) {
      return {
        status: 'APPROVED',
        coolingDays: 0,
        unlockDate: new Date(),
        canAffordNow,
        aiReason: null,
        aiAdvice: null,
      };
    }

    const unlockDate = new Date(
      Date.now() + finalCoolingDays * 24 * 60 * 60 * 1000,
    );
    return {
      status: 'COOLING',
      coolingDays: finalCoolingDays,
      unlockDate,
      canAffordNow,
      aiReason: null,
      aiAdvice: null,
    };
  }
}
