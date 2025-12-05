import { UserSettings } from '@prisma/client';

export interface IUsersSettingsService {
  upsert(userId: string, data: Partial<UserSettings>): Promise<UserSettings>;
  get(userId: string): Promise<UserSettings | null>;
}
