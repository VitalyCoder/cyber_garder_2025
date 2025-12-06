import { Module } from '@nestjs/common';
import { AiService } from 'src/infrastructure/ai/ai.service';
import { PrismaModule } from 'src/infrastructure/db/prisma.module';
import { ReportsCronService } from 'src/use-cases/reports/reports.cron.service';
import { UsersService } from 'src/use-cases/users/users.service';

@Module({
  imports: [PrismaModule],
  providers: [ReportsCronService, UsersService, AiService],
})
export class ReportsModule {}
