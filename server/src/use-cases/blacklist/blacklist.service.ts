import { Injectable } from '@nestjs/common';
import { BlacklistCategory } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/db/prisma.service';
import { IBlacklistService } from './blacklist.service.interface';

@Injectable()
export class BlacklistService implements IBlacklistService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<BlacklistCategory[]> {
    return await this.prisma.blacklistCategory.findMany({ where: { userId } });
  }

  async add(userId: string, name: string): Promise<BlacklistCategory> {
    return await this.prisma.blacklistCategory.create({
      data: { userId, name },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.prisma.blacklistCategory.delete({ where: { id } });
  }

  async exists(userId: string, name: string): Promise<boolean> {
    const found = await this.prisma.blacklistCategory.findFirst({
      where: { userId, name },
    });
    return !!found;
  }
}
