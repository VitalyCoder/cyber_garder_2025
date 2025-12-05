import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/db/prisma.service';
import { IUsersService } from './users.service.interface';

@Injectable()
export class UsersService implements IUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(nickname: string, data: Partial<User> = {}): Promise<User> {
    return this.prisma.user.create({
      data: {
        nickname,
        monthlyIncome: data.monthlyIncome ?? null,
        monthlySavings: data.monthlySavings ?? null,
        currentSavings: data.currentSavings ?? null,
        useSavingsCalculation: data.useSavingsCalculation ?? false,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { nickname } });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        monthlyIncome: data.monthlyIncome ?? undefined,
        monthlySavings: data.monthlySavings ?? undefined,
        currentSavings: data.currentSavings ?? undefined,
        useSavingsCalculation: data.useSavingsCalculation ?? undefined,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
