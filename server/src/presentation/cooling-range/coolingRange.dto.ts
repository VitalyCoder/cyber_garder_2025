import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class AddCoolingRangeDto {
  @ApiProperty({
    example: 0,
    minimum: 0,
    description: 'Нижняя граница цены (включительно)',
  })
  @IsInt()
  @Min(0)
  min!: number;

  @ApiPropertyOptional({
    example: 10000,
    minimum: 0,
    description: 'Верхняя граница цены (включительно), null = без верхней',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  max?: number | null;

  @ApiProperty({
    example: 7,
    minimum: 1,
    description: 'Количество дней охлаждения',
  })
  @IsInt()
  @Min(1)
  days!: number;
}
