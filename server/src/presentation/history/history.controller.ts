import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { IHistoryService } from 'src/use-cases/history/history.service.interface';
import { AddHistoryDto } from './history.dto';

@Controller('users/:userId/history')
export class HistoryController {
  constructor(
    @Inject('IHistoryService') private readonly service: IHistoryService,
  ) {}

  @Post()
  async add(@Param('userId') userId: string, @Body() dto: AddHistoryDto) {
    await this.service.add(userId, dto.action, dto.productName, dto.price);
    return { ok: true };
  }

  @Get()
  list(@Param('userId') userId: string) {
    return this.service.list(userId);
  }
}
