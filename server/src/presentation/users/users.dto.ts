import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'neo',
    description: 'Уникальный никнейм пользователя',
  })
  @IsString()
  nickname!: string;

  @ApiPropertyOptional({
    example: 120000,
    minimum: 0,
    description: 'Месячный доход, ₽',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyIncome?: number;

  @ApiPropertyOptional({
    example: 20000,
    minimum: 0,
    description: 'Ежемесячные накопления, ₽',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlySavings?: number;

  @ApiPropertyOptional({
    example: 50000,
    minimum: 0,
    description: 'Текущие накопления, ₽',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentSavings?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Учитывать накопления при расчётах',
  })
  @IsOptional()
  @IsBoolean()
  useSavingsCalculation?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 120000, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyIncome?: number;

  @ApiPropertyOptional({ example: 20000, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlySavings?: number;

  @ApiPropertyOptional({ example: 50000, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentSavings?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  useSavingsCalculation?: boolean;
}
