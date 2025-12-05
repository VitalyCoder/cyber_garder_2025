import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from './common/configs/config';
import { PrismaModule } from './infrastructure/db/prisma.module';
import { BlacklistModule } from './nest/modules/blacklist.module';
import { CoolingRangeModule } from './nest/modules/coolingRange.module';
import { HistoryModule } from './nest/modules/history.module';
import { NotificationExcludedProductModule } from './nest/modules/notificationExcludedProduct.module';
import { ProductsModule } from './nest/modules/products.module';
import { UsersModule } from './nest/modules/users.module';
import { UsersSettingsModule } from './nest/modules/usersSettings.module';
import { WishlistModule } from './nest/modules/wishlist.module';

@Module({
  imports: [
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
  ],
})
export class AppModule {}
