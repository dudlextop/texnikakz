import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  conversationId!: string;

  @ApiProperty()
  senderId!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty({ type: Object, nullable: true })
  attachments?: Record<string, any> | null;

  @ApiProperty()
  createdAt!: Date;
}
