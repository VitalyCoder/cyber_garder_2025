/* eslint-disable */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../db/prisma.service';
interface TelegramMessage {
  chat?: { id?: number };
  text?: string;
}

interface TelegramCallbackQuery {
  message?: { chat?: { id?: number } };
  data?: string;
}

interface TelegramUpdate {
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botName: string;
  private readonly botToken: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.botName = this.config.get<string>('TELEGRAM_BOT_NAME') ?? '';
    this.botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
  }

  /**
   * Возвращает ссылку t.me/<bot>?start=<payload>, где payload = base64(userId)
   */
  generateDeepLink(userId: string): string {
    const payload = Buffer.from(userId, 'utf8').toString('base64url');
    return `https://t.me/${this.botName}?start=${payload}`;
  }

  /**
   * Обрабатывает апдейт от Telegram (webhook). Линкует chatId к пользователю.
   */
  async handleWebhook(update: TelegramUpdate): Promise<void> {
    console.log(update);

    try {
      const message = update?.message;
      const callback = update?.callback_query;

      let chatId: string | undefined;
      let startPayload: string | undefined;

      if (message?.chat?.id) {
        chatId = String(message.chat.id);
        const text: string | undefined = message.text;
        if (text && text.startsWith('/start')) {
          const parts = text.split(' ');
          startPayload = parts[1];
        }
      } else if (callback?.message?.chat?.id) {
        chatId = String(callback.message.chat.id);
        const data: string | undefined = callback.data;
        if (data && data.startsWith('link:')) {
          startPayload = data.substring('link:'.length);
        }
      }

      if (!chatId || !startPayload) return;

      // Декодируем userId из payload
      let userId = '';
      try {
        userId = Buffer.from(startPayload, 'base64url').toString('utf8');
      } catch {
        // если base64url не сработал, пробуем обычный base64
        try {
          userId = Buffer.from(startPayload, 'base64').toString('utf8');
        } catch {
          this.logger.warn('Invalid start payload');
          return;
        }
      }

      // Сохраняем связь в базе: upsert по userId
      await (this.prisma as any).telegramLink.upsert({
        where: { userId },
        update: { chatId },
        create: { userId, chatId },
      });

      // Дополнительно можно проставить канал уведомлений
      await (this.prisma as any).userSettings.upsert({
        where: { userId },
        update: { notificationChannel: 'telegram' },
        create: { userId, notificationChannel: 'telegram' },
      });
    } catch (e) {
      this.logger.error('Telegram webhook handling failed', e as Error);
    }
  }

  /**
   * Отправка сообщения пользователю по userId (через chatId) с использованием Telegram Bot API
   */
  async sendMessageToUser(userId: string, text: string): Promise<boolean> {
    if (!this.botToken) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not configured');
      return false;
    }
    try {
      const link = await (this.prisma as any).telegramLink.findUnique({
        where: { userId },
      });
      const chatId = link?.chatId;
      if (!chatId) {
        this.logger.warn(`Telegram chatId not linked for user ${userId}`);
        return false;
      }
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      if (!resp.ok) {
        const t = await resp.text();
        this.logger.warn(`Telegram sendMessage failed: ${resp.status} ${t}`);
        return false;
      }
      return true;
    } catch (e) {
      this.logger.error('Telegram sendMessage error', e as Error);
      return false;
    }
  }
}
