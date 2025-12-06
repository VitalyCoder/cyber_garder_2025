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
    productName?: string;
    price?: number;
    category?: string;
    productUrl?: string;
    force?: boolean;
  }): Promise<{
    status: 'APPROVED' | 'COOLING' | 'BLOCKED';
    coolingDays?: number;
    unlockDate?: Date | null;
    canAffordNow?: boolean;
    aiReason?: string | null;
    aiAdvice?: string | null;
    forced?: boolean;
    detectedName?: string;
    detectedPrice?: number;
    detectedCategory?: string;
  }> {
    const { userId, force } = params;
    let price = params.price;
    const categoryInput = params.category;
    let productName = params.productName;

    // 0) Если передана ссылка, пытаемся распарсить через AI
    if (params.productUrl) {
      try {
        const parsed = await this.ai.parseLink(params.productUrl);
        if (parsed?.found) {
          productName = parsed.product_name || productName;
          price = typeof parsed.price === 'number' ? parsed.price : price;
        }
        // Категорию по ссылке AI не возвращает — оставляем переданную или пустую
        // Возвращаем детектированные поля в ответе
        const baseDetected = {
          detectedName: parsed?.product_name,
          detectedPrice: parsed?.price,
          detectedCategory: categoryInput ?? 'Другое',
        } as const;

        // Если после парсинга нет цены — вернём минимально информативный ответ
        if (!price || price <= 0) {
          return {
            status: 'COOLING',
            coolingDays: 0,
            unlockDate: null,
            canAffordNow: false,
            aiReason: parsed?.error ?? 'Не удалось определить цену по ссылке',
            aiAdvice: null,
            forced: false,
            ...baseDetected,
          };
        }

        // Для дальнейшей логики используем распознанные значения
        // productName и price уже скорректированы выше
      } catch {
        // Ошибка сервиса AI — продолжаем без парсинга
      }
    }

    // 1) Check blacklist direct match
    const safeCategory = categoryInput ?? 'Другое';
    const blocked = await this.blacklist.exists(userId, safeCategory);
    if (blocked) {
      return {
        status: 'BLOCKED',
        aiReason: `Категория "${safeCategory}" находится в чёрном списке пользователя`,
        aiAdvice: null,
        canAffordNow: false,
        unlockDate: null,
      };
    }

    // 1.1) AI category similarity against blacklist items (safe fallback on error)
    try {
      const blacklistItems = await this.blacklist.list(userId);
      const aiCat = await this.ai.checkCategorySimilarity(
        safeCategory,
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
    const range = await this.ranges.findForPrice(userId, price ?? 0);
    const coolingDaysByPrice = range?.days ?? 0;

    // 3) User savings rule (useSavingsCalculation)
    const user = await this.users.findById(userId);
    const canAffordNow = (user?.currentSavings ?? 0) >= (price ?? 0);

    let finalCoolingDays = coolingDaysByPrice;
    if (user?.useSavingsCalculation) {
      const monthlySavings = user?.monthlySavings ?? 0;
      // ТЗ: "половина от месячного объёма" — добавим дополнительный период ожидания,
      // если требуется накопить существенную часть суммы.
      // Пример эвристики: сколько месяцев нужно, чтобы накопить половину цены.
      const halfPrice = Math.floor((price ?? 0) / 2);
      const monthsToHalf =
        monthlySavings > 0 ? Math.ceil(halfPrice / monthlySavings) : 0;
      const daysToAffordHalf = monthsToHalf * 30; // грубо, без календаря
      finalCoolingDays = Math.max(coolingDaysByPrice, daysToAffordHalf);
    }

    // 4) Determine status (allow force approve even during cooling)
    if (force === true) {
      return {
        status: 'APPROVED',
        coolingDays: 0,
        unlockDate: new Date(),
        canAffordNow,
        aiReason: 'Покупка одобрена форсом пользователем',
        aiAdvice: null,
        forced: true,
      };
    }

    if (finalCoolingDays <= 0 && canAffordNow) {
      return {
        status: 'APPROVED',
        coolingDays: 0,
        unlockDate: new Date(),
        canAffordNow,
        aiReason: null,
        aiAdvice: null,
        forced: false,
        detectedName: productName,
        detectedPrice: price,
        detectedCategory: safeCategory,
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
        product_name: productName ?? 'Товар',
        price: price ?? 0,
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
      forced: false,
      detectedName: productName,
      detectedPrice: price,
      detectedCategory: safeCategory,
    };
  }
}
