import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/db/prisma.service';
import { INotificationExcludedProductService } from './notificationExcludedProduct.service.interface';

@Injectable()
export class NotificationExcludedProductService implements INotificationExcludedProductService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    userId: string,
  ): Promise<{ id: string; productName: string; wishlistId: string | null }[]> {
    const rows = await this.prisma.notificationExcludedProduct.findMany({
      where: { userId },
    });
    return rows.map((r) => ({
      id: r.id,
      productName: r.productName,
      wishlistId: r.wishlistId ?? null,
    }));
  }

  async add(
    userId: string,
    productName: string,
    wishlistId?: string,
  ): Promise<{ id: string }> {
    const created = await this.prisma.notificationExcludedProduct.create({
      data: { userId, productName, wishlistId: wishlistId ?? null },
    });
    return { id: created.id };
  }

  async remove(id: string): Promise<void> {
    await this.prisma.notificationExcludedProduct.delete({ where: { id } });
  }

  async exists(userId: string, productName: string): Promise<boolean> {
    const found = await this.prisma.notificationExcludedProduct.findFirst({
      where: { userId, productName },
    });
    return !!found;
  }
}
