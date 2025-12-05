import { Injectable } from '@nestjs/common';
import { UserSettings } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/db/prisma.service';
import { IUsersSettingsService } from './usersSettings.service.interface';

@Injectable()
export class UsersSettingsService implements IUsersSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    userId: string,
    data: Partial<UserSettings>,
  ): Promise<UserSettings> {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        notificationChannel: data.notificationChannel ?? null,
        notificationFrequency: data.notificationFrequency ?? null,
      },
      update: {
        notificationChannel: data.notificationChannel ?? undefined,
        notificationFrequency: data.notificationFrequency ?? undefined,
      },
    });
  }

  async get(userId: string): Promise<UserSettings | null> {
    return this.prisma.userSettings.findUnique({ where: { userId } });
  }
}
