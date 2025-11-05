import { ApiProperty } from '@nestjs/swagger';
import { MediaKind } from '@prisma/client';

export class MediaDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: MediaKind })
  kind!: MediaKind;

  @ApiProperty()
  bucket!: string;

  @ApiProperty()
  objectKey!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty({ nullable: true })
  previewUrl?: string | null;
}
