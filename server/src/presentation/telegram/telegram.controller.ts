import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TelegramService } from '../../infrastructure/telegram/telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly tg: TelegramService) {}

  /**
   * Возвращает deep-link на бота для привязки
   * GET /telegram/deeplink?userId=...
   */
  @Get('deeplink')
  getDeeplink(@Query('userId') userId: string) {
    return { url: this.tg.generateDeepLink(userId) };
  }

  /**
   * Вебхук для телеграма
   * POST /telegram/webhook
   */
  @Post('webhook')
  async webhook(@Body() update: unknown) {
    await this.tg.handleWebhook(update as Record<string, unknown>);
    return { ok: true };
  }

  /**
   * Тестовая отправка сообщения пользователю (для проверки привязки)
   * POST /telegram/send-test
   * Body: { userId: string, text: string }
   */
  @Post('send-test')
  async sendTest(@Body() body: { userId: string; text?: string }) {
    const ok = await this.tg.sendMessageToUser(
      body.userId,
      body.text ??
        'Привязка Telegram выполнена. Уведомления будут приходить сюда.',
    );
    return { ok };
  }
}
