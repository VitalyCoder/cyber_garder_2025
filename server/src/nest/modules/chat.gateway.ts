import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AiService } from '../../infrastructure/ai/ai.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly aiService: AiService) {}

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
    const text = payload?.text?.trim();
    if (!text) return;

    try {
      // Отправляем сообщение нейронке через AiService
      const reply = await this.aiService.chat(text, {
        userId: payload.userId,
        context: payload.context,
        history: payload.history,
      });
      // Отправляем ответ ТОЛЬКО инициатору вопроса
      client.emit('chat:reply', {
        text: reply ?? '...',
        is_refusal: false,
      });
    } catch (e) {
      this.logger.error('AI call failed', e as Error);
      client.emit('chat:error', { message: 'AI недоступен' });
    }
  }
}
