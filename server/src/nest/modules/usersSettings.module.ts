import { Module } from '@nestjs/common';
import { UsersSettingsController } from 'src/presentation/users-settings/usersSettings.controller';
import { UsersSettingsService } from 'src/use-cases/users-settings/usersSettings.service';

@Module({
  imports: [],
  controllers: [UsersSettingsController],
  providers: [
    {
      provide: 'IUsersSettingsService',
      useClass: UsersSettingsService,
    },
  ],
  exports: ['IUsersSettingsService'],
})
export class UsersSettingsModule {}
