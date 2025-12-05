import { Module } from '@nestjs/common';
import { HistoryController } from 'src/presentation/history/history.controller';
import { HistoryService } from 'src/use-cases/history/history.service';

@Module({
  imports: [],
  controllers: [HistoryController],
  providers: [
    {
      provide: 'IHistoryService',
      useClass: HistoryService,
    },
  ],
  exports: ['IHistoryService'],
})
export class HistoryModule {}
