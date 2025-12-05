import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddBlacklistCategoryDto {
  @ApiProperty({
    example: 'Гаджеты',
    description: 'Название запрещённой категории',
  })
  @IsString()
  name!: string;
}
