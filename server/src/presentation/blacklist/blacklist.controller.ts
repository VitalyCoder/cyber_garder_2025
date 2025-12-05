import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { IBlacklistService } from 'src/use-cases/blacklist/blacklist.service.interface';
import { AddBlacklistCategoryDto } from './blacklist.dto';

@Controller('users/:userId/blacklist')
export class BlacklistController {
  constructor(
    @Inject('IBlacklistService')
    private readonly blacklistService: IBlacklistService,
  ) {}

  @Get()
  list(@Param('userId') userId: string) {
    return this.blacklistService.list(userId);
  }

  @Post()
  add(@Param('userId') userId: string, @Body() dto: AddBlacklistCategoryDto) {
    return this.blacklistService.add(userId, dto.name);
  }

  @Delete(':id')
  async remove(@Param('userId') userId: string, @Param('id') id: string) {
    await this.blacklistService.remove(userId, id);
    return { ok: true };
  }

  @Get('exists')
  async exists(@Param('userId') userId: string, @Query('name') name: string) {
    const exists = await this.blacklistService.exists(userId, name);
    return { exists };
  }
}
