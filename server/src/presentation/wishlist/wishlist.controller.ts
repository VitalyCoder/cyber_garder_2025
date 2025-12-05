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
  ) {}

  @Post()
  create(@Param('userId') userId: string, @Body() dto: CreateWishlistItemDto) {
    return this.service.create(
      userId,
      dto.productName,
      dto.price,
      dto.category,
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
