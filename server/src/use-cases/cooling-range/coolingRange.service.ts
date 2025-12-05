import { Injectable } from '@nestjs/common';
import { CoolingRange } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/db/prisma.service';
import { ICoolingRangeService } from './coolingRange.service.interface';

@Injectable()
export class CoolingRangeService implements ICoolingRangeService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<CoolingRange[]> {
    return await this.prisma.coolingRange.findMany({
      where: { userId },
      orderBy: { min: 'asc' },
    });
  }

  async add(
    userId: string,
    min: number,
    max: number | null,
    days: number,
  ): Promise<CoolingRange> {
    return await this.prisma.coolingRange.create({
      data: { userId, min, max, days },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.coolingRange.delete({ where: { id } });
  }

  async findForPrice(
    userId: string,
    price: number,
  ): Promise<CoolingRange | null> {
    // Подбираем диапазон: min <= price AND (max IS NULL OR price <= max)
    return await this.prisma.coolingRange.findFirst({
      where: {
        userId,
        min: { lte: price },
        OR: [{ max: null }, { max: { gte: price } }],
      },
      orderBy: { min: 'desc' },
    });
  }
}
