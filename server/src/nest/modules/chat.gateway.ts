import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/use-cases/users/users.service';
import { AiService } from '../../infrastructure/ai/ai.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('chat:message')
  async onMessage(
    @MessageBody()
    payload: {
      text: string;
      userId?: string;
      context?: Record<string, any>;
      history?: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
      }>;
    },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(payload);

    const text = payload?.text?.trim();
    if (!text) return;

    try {
      // Отправляем сообщение нейронке через AiService
      // Собираем минимально необходимый контекст для AI, если клиент его не передал
      let ctx = payload.context;
      if (!ctx) {
        const userId = payload.userId;
        if (userId) {
          const user = await this.usersService.findById(userId);
          ctx = {
            nickname: user?.nickname ?? 'user',
            monthly_income: user?.monthlyIncome ?? 0,
            current_savings: user?.currentSavings ?? 0,
            monthly_savings: user?.monthlySavings ?? 0,
          };
        } else {
          ctx = {
            nickname: 'user',
            monthly_income: 0,
            current_savings: 0,
            monthly_savings: 0,
          };
        }
      }

      const reply = await this.aiService.chat(text, {
        userId: payload.userId,
        context: ctx,
        history: payload.history,
      });
      console.log(reply);

      // Отправляем ответ ТОЛЬКО инициатору вопроса
      client.emit('chat:reply', {
        text: reply?.reply ?? '...',
        is_refusal: false,
      });
    } catch (e) {
      const err = e as Error;
      this.logger.error('AI call failed', err);
      client.emit('chat:error', {
        message:
          'Сервис ИИ сейчас недоступен или отвечает слишком медленно. Попробуй ещё раз чуть позже.',
      });
    }
  }
}
