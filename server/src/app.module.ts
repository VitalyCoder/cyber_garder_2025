import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { config } from './common/configs/config';
import { AiService } from './infrastructure/ai/ai.service';
import { PrismaModule } from './infrastructure/db/prisma.module';
import { BlacklistModule } from './nest/modules/blacklist.module';
import { ChatGateway } from './nest/modules/chat.gateway';
import { CoolingRangeModule } from './nest/modules/coolingRange.module';
import { HistoryModule } from './nest/modules/history.module';
import { NotificationExcludedProductModule } from './nest/modules/notificationExcludedProduct.module';
import { ProductsModule } from './nest/modules/products.module';
import { ReportsModule } from './nest/modules/reports.module';
import { TelegramModule } from './nest/modules/telegram.module';
import { UsersModule } from './nest/modules/users.module';
import { UsersSettingsModule } from './nest/modules/usersSettings.module';
import { WishlistModule } from './nest/modules/wishlist.module';
import { UsersService } from './use-cases/users/users.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(config),
    PrismaModule,
    BlacklistModule,
    WishlistModule,
    HistoryModule,
    NotificationExcludedProductModule,
    UsersModule,
    UsersSettingsModule,
    CoolingRangeModule,
    ProductsModule,
    TelegramModule,
    ReportsModule,
  ],
  providers: [UsersService, ChatGateway, AiService],
})
export class AppModule {}
