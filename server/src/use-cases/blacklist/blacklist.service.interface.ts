import { BlacklistCategory } from '@prisma/client';

export interface IBlacklistService {
  list(userId: string): Promise<BlacklistCategory[]>;
  add(userId: string, name: string): Promise<BlacklistCategory>;
  remove(userId: string, id: string): Promise<void>;
  exists(userId: string, name: string): Promise<boolean>;
}
