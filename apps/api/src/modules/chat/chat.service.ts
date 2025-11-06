import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Conversation, Message } from '@prisma/client';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { PrismaService } from '../database/prisma.service';
import { ConversationDto } from './dto/conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ListConversationsQueryDto } from './dto/list-conversations.query';
import { ListMessagesQueryDto } from './dto/list-messages.query';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getConversations(user: AuthenticatedUser, query: ListConversationsQueryDto): Promise<ConversationDto[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: user.id }, { sellerId: user.id }],
        ...(query.listingId ? { listingId: query.listingId } : {}),
        ...(query.specialistId ? { specialistId: query.specialistId } : {})
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return conversations.map((conv) => this.toConversationDto(conv));
  }

  async getMessages(
    conversationId: string,
    user: AuthenticatedUser,
    query: ListMessagesQueryDto
  ): Promise<MessageDto[]> {
    await this.ensureParticipant(conversationId, user);
    const take = query.limit ?? 20;
    const cursor = query.cursor ? { id: query.cursor } : undefined;
    const direction = query.direction === 'forward' ? 'asc' : 'desc';

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      ...(cursor ? { cursor, skip: 1 } : {}),
      orderBy: { createdAt: direction },
      take
    });

    if (direction === 'asc') {
      return messages.map((msg) => this.toMessageDto(msg));
    }
    return messages.map((msg) => this.toMessageDto(msg)).reverse();
  }

  async createMessage(
    conversationId: string,
    dto: CreateMessageDto,
    user: AuthenticatedUser
  ): Promise<MessageDto> {
    await this.ensureParticipant(conversationId, user);
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        body: dto.body,
        attachments: dto.attachments ?? null
      }
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return this.toMessageDto(message);
  }

  async ensureParticipant(conversationId: string, user: AuthenticatedUser) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
      throw new ForbiddenException('Not a participant of this conversation');
    }
    return conversation;
  }

  private toConversationDto(conversation: Conversation & { messages?: Message[] }): ConversationDto {
    const lastMessage = conversation.messages?.[0];
    return {
      id: conversation.id,
      listingId: conversation.listingId,
      specialistId: conversation.specialistId,
      buyerId: conversation.buyerId,
      sellerId: conversation.sellerId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      lastMessage: lastMessage ? this.toMessageDto(lastMessage) : null
    };
  }

  private toMessageDto(message: Message): MessageDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      body: message.body,
      attachments: (message.attachments as Record<string, any> | null) ?? null,
      createdAt: message.createdAt
    };
  }
}
