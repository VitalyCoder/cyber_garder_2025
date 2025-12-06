import { Logger } from '@nestjs/common';
import {
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

  @SubscribeMessage('message')
  async onMessage(@MessageBody() payload: { text: string; userId?: string }) {
    const text = payload?.text?.trim();
    if (!text) return;

    try {
      // Отправляем сообщение нейронке через AiService
      const aiReply = await this.aiService.chat(text, payload.userId);
      // Эмитим ответ всем клиентам текущего соединения (или конкретному пользователю)
      this.server.emit('reply', { text: aiReply ?? '...' });
    } catch (e) {
      this.logger.error('AI call failed', e as Error);
      this.server.emit('error', { message: 'AI недоступен' });
    }
  }
}
