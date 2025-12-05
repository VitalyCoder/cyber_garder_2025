import { Module } from '@nestjs/common';
import { UsersController } from 'src/presentation/users/users.controller';
import { UsersService } from 'src/use-cases/users/users.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    {
      provide: 'IUsersService',
      useClass: UsersService,
    },
  ],
  exports: ['IUsersService'],
})
export class UsersModule {}
