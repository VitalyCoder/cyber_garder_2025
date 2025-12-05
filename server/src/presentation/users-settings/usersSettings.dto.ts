import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class UpsertUserSettingsDto {
  @ApiPropertyOptional({
    enum: ['daily', 'weekly', 'monthly'],
    description: 'Частота уведомлений',
  })
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly'])
  notificationFrequency?: 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({
    enum: ['browser', 'email', 'telegram'],
    description: 'Канал уведомлений',
  })
  @IsOptional()
  @IsIn(['browser', 'email', 'telegram'])
  notificationChannel?: 'browser' | 'email' | 'telegram';
}
