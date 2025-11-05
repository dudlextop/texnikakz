import { ApiProperty } from '@nestjs/swagger';

export class DealerSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}
