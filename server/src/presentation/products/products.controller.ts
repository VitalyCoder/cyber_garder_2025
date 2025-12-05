import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from 'src/use-cases/products/products.service';
import { CheckProductDto, CheckProductResponseDto } from './products.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post('check')
  async check(@Body() dto: CheckProductDto): Promise<CheckProductResponseDto> {
    const result = await this.products.checkProduct({
      userId: dto.userId,
      productName: dto.productName,
      price: dto.price,
      category: dto.category,
    });

    return {
      status: result.status,
      cooling_days: result.coolingDays,
      unlock_date: result.unlockDate?.toISOString() ?? null,
      ai_reason: result.aiReason ?? null,
      ai_advice: result.aiAdvice ?? null,
      can_afford_now: result.canAffordNow ?? false,
    };
  }
}
