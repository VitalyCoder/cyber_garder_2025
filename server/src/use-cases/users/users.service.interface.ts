import { User } from '@prisma/client';

export interface IUsersService {
  create(nickname: string, data?: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByNickname(nickname: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
