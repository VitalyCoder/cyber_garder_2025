import { Module } from '@nestjs/common';
import { CoolingRangeController } from 'src/presentation/cooling-range/coolingRange.controller';
import { CoolingRangeService } from 'src/use-cases/cooling-range/coolingRange.service';

@Module({
  imports: [],
  controllers: [CoolingRangeController],
  providers: [
    {
      provide: 'ICoolingRangeService',
      useClass: CoolingRangeService,
    },
  ],
  exports: [],
})
export class CoolingRangeModule {}
