import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../infrastructure/db/prisma.module';
import { TelegramService } from '../../infrastructure/telegram/telegram.service';
import { TelegramController } from '../../presentation/telegram/telegram.controller';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [TelegramService],
  controllers: [TelegramController],
})
export class TelegramModule {}
