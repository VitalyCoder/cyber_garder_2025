import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { INotificationExcludedProductService } from 'src/use-cases/notification-excluded-product/notificationExcludedProduct.service.interface';
import { AddNotificationExcludedProductDto } from './notificationExcludedProduct.dto';

@Controller('users/:userId/notifications/excluded')
export class NotificationExcludedProductController {
  constructor(
    @Inject('INotificationExcludedProductService')
    private readonly service: INotificationExcludedProductService,
  ) {}

  @Get()
  list(@Param('userId') userId: string) {
    return this.service.list(userId);
  }

  @Post()
  add(
    @Param('userId') userId: string,
    @Body() dto: AddNotificationExcludedProductDto,
  ) {
    return this.service.add(userId, dto.productName, dto.wishlistId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { ok: true };
  }

  @Get('exists')
  async exists(
    @Param('userId') userId: string,
    @Query('productName') productName: string,
  ) {
    const exists = await this.service.exists(userId, productName);
    return { exists };
  }
}
