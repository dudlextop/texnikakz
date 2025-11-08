import { ApiProperty } from '@nestjs/swagger';
import { PromotionDto } from './promotion.dto';

export class ApplyPromotionResultDto {
  @ApiProperty({ type: PromotionDto, nullable: true })
  promotion!: PromotionDto | null;

  @ApiProperty()
  boostScore!: number;
}
