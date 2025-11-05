import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ChatService } from './chat.service';
import { ConversationDto } from './dto/conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ListConversationsQueryDto } from './dto/list-conversations.query';
import { ListMessagesQueryDto } from './dto/list-messages.query';
import { MessageDto } from './dto/message.dto';

@ApiTags('chat')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOkResponse({ type: [ConversationDto] })
  listConversations(@CurrentUser() user: AuthenticatedUser, @Query() query: ListConversationsQueryDto) {
    return this.chatService.getConversations(user, query);
  }

  @Get(':id/messages')
  @ApiOkResponse({ type: [MessageDto] })
  getMessages(
    @Param('id') conversationId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListMessagesQueryDto
  ) {
    return this.chatService.getMessages(conversationId, user, query);
  }

  @Post(':id/messages')
  @ApiOkResponse({ type: MessageDto })
  postMessage(
    @Param('id') conversationId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMessageDto
  ) {
    return this.chatService.createMessage(conversationId, dto, user);
  }
}
