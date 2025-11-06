import { ApiProperty } from '@nestjs/swagger';
import { MessageDto } from './message.dto';

export class ConversationDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  listingId?: string | null;

  @ApiProperty({ nullable: true })
  specialistId?: string | null;

  @ApiProperty()
  buyerId!: string;

  @ApiProperty()
  sellerId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: () => MessageDto, nullable: true })
  lastMessage?: MessageDto | null;
}
