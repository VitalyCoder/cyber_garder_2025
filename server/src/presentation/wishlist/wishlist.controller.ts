import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AiService } from 'src/infrastructure/ai/ai.service';
import { PrismaService } from 'src/infrastructure/db/prisma.service';
import { IWishlistService } from 'src/use-cases/wishlist/wishlist.service.interface';
import {
  AddAIRecommendationDto,
  CreateWishlistItemDto,
  UpdateWishlistStatusDto,
} from './wishlist.dto';

@Controller('users/:userId/wishlist')
export class WishlistController {
  constructor(
    @Inject('IWishlistService') private readonly service: IWishlistService,
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  @Post()
  async create(
    @Param('userId') userId: string,
    @Body() dto: CreateWishlistItemDto,
  ) {
    // Собираем кандидатов категорий из данных пользователя
    const [wishlistCats, blacklistCats] = await Promise.all([
      this.prisma.wishlist
        .findMany({ where: { userId }, select: { category: true } })
        .then((rows) => rows.map((r) => r.category)),
      this.prisma.blacklistCategory
        .findMany({ where: { userId }, select: { name: true } })
        .then((rows) => rows.map((r) => r.name)),
    ]);
    const defaultCats = [
      'Электроника',
      'Гаджеты',
      'Одежда',
      'Еда',
      'Развлечения',
      'Видеоигры',
      'Красота',
      'Дом',
      'Транспорт',
      'Путешествия',
    ];
    const candidates = Array.from(
      new Set(
        [...wishlistCats, ...blacklistCats, ...defaultCats].filter(Boolean),
      ),
    );

    // Исходная строка для нормализации: category или productName
    const inputForCategory = (dto.category?.trim() || dto.productName).trim();

    let normalizedCategory = inputForCategory;
    if (candidates.length > 0) {
      try {
        const sim = await this.ai.checkCategorySimilarity(
          inputForCategory,
          candidates,
        );
        if (sim?.related_to && (sim?.similarity ?? 0) >= 0.6) {
          normalizedCategory = sim.related_to;
        }
      } catch {
        // В случае ошибки AI оставляем исходную категорию
      }
    }

    return this.service.create(
      userId,
      dto.productName,
      dto.price,
      normalizedCategory,
      dto.coolingPeriodDays,
      dto.unlockDate ? new Date(dto.unlockDate) : null,
    );
  }

  @Get()
  list(@Param('userId') userId: string) {
    return this.service.listByUser(userId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateWishlistStatusDto,
  ) {
    await this.service.updateStatus(id, dto.status);
    return { ok: true };
  }

  @Patch(':id/ai-recommendation')
  async addAIRecommendation(
    @Param('id') id: string,
    @Body() dto: AddAIRecommendationDto,
  ) {
    await this.service.addAIRecommendation(id, dto.recommendation);
    return { ok: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { ok: true };
  }
}
