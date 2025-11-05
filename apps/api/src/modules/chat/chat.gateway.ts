import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { WsJwtGuard } from '../common/guards/ws-jwt.guard';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

interface AuthenticatedSocket extends Socket {
  user?: AuthenticatedUser;
}

@WebSocketGateway({ namespace: '/ws/chat', cors: { origin: true, credentials: true } })
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: AuthenticatedSocket) {
    if (!client.user) {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    client.leaveAll();
  }

  @SubscribeMessage('joinConversation')
  async handleJoin(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { conversationId: string }) {
    if (!client.user) {
      return;
    }
    await this.chatService.ensureParticipant(data.conversationId, client.user);
    client.join(data.conversationId);
    client.emit('joined', { conversationId: data.conversationId });
  }

  @SubscribeMessage('sendMessage')
  async handleSend(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId: string } & CreateMessageDto
  ) {
    if (!client.user) {
      return;
    }
    const message = await this.chatService.createMessage(payload.conversationId, payload, client.user);
    this.server.to(payload.conversationId).emit('message', message);
  }
}
