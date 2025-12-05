import { Body, Controller, Get, Inject, Param, Put } from '@nestjs/common';
import { IUsersSettingsService } from 'src/use-cases/users-settings/usersSettings.service.interface';
import { UpsertUserSettingsDto } from './usersSettings.dto';

@Controller('users/:userId/settings')
export class UsersSettingsController {
  constructor(
    @Inject('IUsersSettingsService')
    private readonly settingsService: IUsersSettingsService,
  ) {}

  @Put()
  upsert(@Param('userId') userId: string, @Body() dto: UpsertUserSettingsDto) {
    return this.settingsService.upsert(userId, dto);
  }

  @Get()
  get(@Param('userId') userId: string) {
    return this.settingsService.get(userId);
  }
}
