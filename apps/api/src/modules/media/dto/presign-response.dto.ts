import { ApiProperty } from '@nestjs/swagger';

export class PresignResponseDto {
  @ApiProperty()
  url!: string;

  @ApiProperty()
  bucket!: string;

  @ApiProperty()
  objectKey!: string;

  @ApiProperty()
  expiresIn!: number;
}
