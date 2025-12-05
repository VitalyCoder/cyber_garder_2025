import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CheckProductDto {
  @ApiProperty({ example: 'MacBook Pro' })
  @IsString()
  productName!: string;

  @ApiProperty({ example: 150000, minimum: 0 })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 'Техника' })
  @IsString()
  category!: string;

  @ApiProperty({ example: 'uuid-user' })
  @IsString()
  userId!: string;
}

export class CheckProductResponseDto {
  status!: 'APPROVED' | 'COOLING' | 'BLOCKED';
  cooling_days?: number;
  unlock_date?: string | null;
  ai_reason?: string | null;
  ai_advice?: string | null;
  can_afford_now?: boolean;
}
