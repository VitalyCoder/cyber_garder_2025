import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/db/prisma.service';
import { IWishlistService, WishlistStatus } from './wishlist.service.interface';

@Injectable()
export class WishlistService implements IWishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    productName: string,
    price: number,
    category: string,
    coolingPeriodDays: number,
    unlockDate?: Date | null,
  ): Promise<{ id: string }> {
    const created = await this.prisma.wishlist.create({
      data: {
        userId,
        productName,
        price,
        category,
        coolingPeriodDays,
        unlockDate: unlockDate ?? null,
      },
      select: { id: true },
    });
    return created;
  }

  async listByUser(userId: string): Promise<
    {
      id: string;
      productName: string;
      price: number;
      category: string;
      coolingPeriodDays: number;
      unlockDate: Date | null;
      status: WishlistStatus;
      aiRecommendation: string | null;
      createdAt: Date;
    }[]
  > {
    const rows = await this.prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      productName: r.productName,
      price: r.price,
      category: r.category,
      coolingPeriodDays: r.coolingPeriodDays,
      unlockDate: r.unlockDate ?? null,
      status: r.status as WishlistStatus,
      aiRecommendation: r.aiRecommendation ?? null,
      createdAt: r.createdAt,
    }));
  }

  async updateStatus(id: string, status: WishlistStatus): Promise<void> {
    await this.prisma.wishlist.update({ where: { id }, data: { status } });
  }

  async addAIRecommendation(id: string, recommendation: string): Promise<void> {
    await this.prisma.wishlist.update({
      where: { id },
      data: { aiRecommendation: recommendation },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.wishlist.delete({ where: { id } });
  }
}
