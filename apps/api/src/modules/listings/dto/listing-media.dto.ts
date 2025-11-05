import { ApiProperty } from '@nestjs/swagger';
import { MediaKind } from '@prisma/client';

export class ListingMediaDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: MediaKind })
  kind!: MediaKind;

  @ApiProperty()
  url!: string;

  @ApiProperty({ nullable: true })
  previewUrl?: string | null;
}
