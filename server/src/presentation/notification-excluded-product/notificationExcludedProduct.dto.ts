import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddNotificationExcludedProductDto {
  @ApiProperty({
    example: 'Наушники',
    description: 'Товар, который нужно исключить из уведомлений',
  })
  @IsString()
  productName!: string;

  @ApiPropertyOptional({
    example: 'uuid-wishlist',
    description: 'Опциональная связь с записью вишлиста',
  })
  @IsOptional()
  @IsString()
  wishlistId?: string;
}
