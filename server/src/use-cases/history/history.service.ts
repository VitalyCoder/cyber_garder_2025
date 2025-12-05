import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/db/prisma.service';
import { IHistoryService } from './history.service.interface';

@Injectable()
export class HistoryService implements IHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async add(
    userId: string,
    action: 'bought' | 'cancelled' | 'removed' | 'postponed',
    productName?: string,
    price?: number,
  ): Promise<void> {
    await this.prisma.history.create({
      data: {
        userId,
        action,
        productName: productName ?? null,
        price: price ?? null,
      },
    });
  }

  async list(userId: string): Promise<
    {
      id: string;
      action: string;
      productName: string | null;
      price: number | null;
      actionDate: Date;
    }[]
  > {
    const rows = await this.prisma.history.findMany({
      where: { userId },
      orderBy: { actionDate: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      action: r.action,
      productName: r.productName ?? null,
      price: r.price ?? null,
      actionDate: r.actionDate,
    }));
  }
}
