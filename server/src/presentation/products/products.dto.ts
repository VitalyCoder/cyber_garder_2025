import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CheckProductDto {
  @ApiPropertyOptional({ example: 'MacBook Pro' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ example: 150000, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'Техника' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 'uuid-user' })
  @IsString()
  userId!: string;

  @ApiPropertyOptional({ example: 'https://market.yandex.ru/product/123' })
  @IsOptional()
  @IsUrl()
  productUrl?: string;

  @ApiPropertyOptional({ description: 'Форс-одобрение покупки при заморозке' })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class CheckProductResponseDto {
  status!: 'APPROVED' | 'COOLING' | 'BLOCKED';
  cooling_days?: number;
  unlock_date?: string | null;
  ai_reason?: string | null;
  ai_advice?: string | null;
  can_afford_now?: boolean;
  forced?: boolean;
  // Доп. поля для режима анализа ссылки
  detected_name?: string;
  detected_price?: number;
  detected_category?: string;
}
