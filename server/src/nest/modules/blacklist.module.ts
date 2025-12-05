import { Module } from '@nestjs/common';
import { BlacklistController } from 'src/presentation/blacklist/blacklist.controller';
import { BlacklistService } from 'src/use-cases/blacklist/blacklist.service';

@Module({
  imports: [],
  controllers: [BlacklistController],
  providers: [
    {
      provide: 'IBlacklistService',
      useClass: BlacklistService,
    },
  ],
  exports: [],
})
export class BlacklistModule {}
