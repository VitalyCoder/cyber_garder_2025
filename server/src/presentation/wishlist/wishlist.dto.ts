import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateWishlistItemDto {
  @ApiProperty({ example: 'Наушники', description: 'Название товара' })
  @IsString()
  productName!: string;

  @ApiProperty({ example: 7990, minimum: 0, description: 'Цена товара, ₽' })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    example: 'Гаджеты',
    description: 'Категория товара (опционально, может быть нормализована ИИ)',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    example: 7,
    minimum: 0,
    description: 'Период охлаждения в днях',
  })
  @IsInt()
  @Min(0)
  coolingPeriodDays!: number;

  @ApiPropertyOptional({
    example: '2025-01-10T00:00:00.000Z',
    description: 'Дата разблокировки (ISO), опционально',
  })
  @IsOptional()
  @IsDateString()
  unlockDate?: string | null;
}

export class UpdateWishlistStatusDto {
  @ApiProperty({
    enum: ['waiting', 'ready', 'bought', 'cancelled'],
    description: 'Статус записи',
  })
  @IsIn(['waiting', 'ready', 'bought', 'cancelled'])
  status!: 'waiting' | 'ready' | 'bought' | 'cancelled';
}

export class AddAIRecommendationDto {
  @ApiProperty({
    example: 'Отложить покупку на 7 дней',
    description: 'Короткая рекомендация ИИ',
  })
  @IsString()
  recommendation!: string;
}
