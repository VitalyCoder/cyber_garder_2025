import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AiService } from 'src/infrastructure/ai/ai.service';
import { PrismaService } from 'src/infrastructure/db/prisma.service';

@Injectable()
export class ReportsCronService {
  private readonly logger = new Logger(ReportsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  // Ежедневно в 18:00 генерируем финансовый план для каждого пользователя
  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async generateDailyFinancialPlans() {
    this.logger.log('Starting daily financial plan generation...');
    const users = await this.prisma.user.findMany();

    for (const u of users) {
      try {
        const plan = await this.ai.financialPlan({
          nickname: u.nickname,
          monthly_income: u.monthlyIncome ?? 0,
          current_savings: u.currentSavings ?? 0,
          financial_goal: 'Общий финансовый план',
          goal_cost: 0,
          expenses_breakdown: 'Не указано',
        });

        await this.prisma.report.create({
          data: {
            userId: u.id,
            type: 'financial_plan',
            contentMarkdown: plan?.plan_markdown ?? '',
            keySteps: JSON.stringify(plan?.key_steps ?? []),
          },
        });
      } catch (err) {
        this.logger.warn(
          `Failed to generate plan for user ${u.id}: ${(err as Error).message}`,
        );
      }
    }
    this.logger.log('Daily financial plan generation finished.');
  }
}
