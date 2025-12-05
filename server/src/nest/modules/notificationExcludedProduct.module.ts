import { Module } from '@nestjs/common';
import { NotificationExcludedProductController } from 'src/presentation/notification-excluded-product/notificationExcludedProduct.controller';
import { NotificationExcludedProductService } from 'src/use-cases/notification-excluded-product/notificationExcludedProduct.service';

@Module({
  imports: [],
  controllers: [NotificationExcludedProductController],
  providers: [
    {
      provide: 'INotificationExcludedProductService',
      useClass: NotificationExcludedProductService,
    },
  ],
  exports: [],
})
export class NotificationExcludedProductModule {}
