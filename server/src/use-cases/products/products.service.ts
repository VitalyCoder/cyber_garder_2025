import { Injectable } from '@nestjs/common';
import { AiService } from 'src/infrastructure/ai/ai.service';
import { BlacklistService } from 'src/use-cases/blacklist/blacklist.service';
import { CoolingRangeService } from 'src/use-cases/cooling-range/coolingRange.service';
import { UsersService } from 'src/use-cases/users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly users: UsersService,
    private readonly blacklist: BlacklistService,
    private readonly ranges: CoolingRangeService,
    private readonly ai: AiService,
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

    // 1) Check blacklist direct match
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

    // 1.1) AI category similarity against blacklist items (safe fallback on error)
    try {
      const blacklistItems = await this.blacklist.list(userId);
      const aiCat = await this.ai.checkCategorySimilarity(
        category,
        blacklistItems.map((b) => b.name),
      );
      if (aiCat?.is_blocked && (aiCat?.similarity ?? 0) > 0.7) {
        return {
          status: 'BLOCKED',
          aiReason: aiCat?.reason ?? 'Категория заблокирована (AI)',
          aiAdvice: null,
          canAffordNow: false,
          unlockDate: null,
        };
      }
    } catch {
      // ignore AI errors
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
    // 5) AI purchase advice (safe fallback on error)
    let aiReason: string | null = null;
    let aiAdvice: string | null = null;
    let status: 'APPROVED' | 'COOLING' | 'BLOCKED' = 'COOLING';
    try {
      const advice = await this.ai.getPurchaseAdvice({
        product_name: params.productName,
        price,
        user_income: user?.monthlyIncome ?? 0,
        user_savings: user?.currentSavings ?? 0,
        monthly_savings: user?.monthlySavings ?? 0,
        cooling_days: finalCoolingDays,
      });
      aiAdvice = advice?.advice ?? null;
      aiReason = advice?.key_message ?? null;
      if (advice?.status === 'APPROVED' || advice?.status === 'BLOCKED') {
        status = advice.status;
      }
    } catch {
      // ignore AI errors
    }

    return {
      status,
      coolingDays: finalCoolingDays,
      unlockDate,
      canAffordNow,
      aiReason,
      aiAdvice,
    };
  }
}
