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
import { ICoolingRangeService } from 'src/use-cases/cooling-range/coolingRange.service.interface';
import { AddCoolingRangeDto } from './coolingRange.dto';

@Controller('users/:userId/cooling-ranges')
export class CoolingRangeController {
  constructor(
    @Inject('ICoolingRangeService')
    private readonly service: ICoolingRangeService,
  ) {}

  @Get()
  list(@Param('userId') userId: string) {
    return this.service.list(userId);
  }

  @Post()
  add(@Param('userId') userId: string, @Body() dto: AddCoolingRangeDto) {
    return this.service.add(userId, dto.min, dto.max ?? null, dto.days);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { ok: true };
  }

  @Get('find')
  find(@Param('userId') userId: string, @Query('price') price: string) {
    return this.service.findForPrice(userId, Number(price));
  }
}
