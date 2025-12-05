import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddHistoryDto {
  @ApiProperty({
    enum: ['bought', 'cancelled', 'removed', 'postponed'],
    description: 'Тип действия',
  })
  @IsIn(['bought', 'cancelled', 'removed', 'postponed'])
  action!: 'bought' | 'cancelled' | 'removed' | 'postponed';

  @ApiPropertyOptional({ example: 'Наушники', description: 'Название товара' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({
    example: 7990,
    minimum: 0,
    description: 'Цена товара',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}
