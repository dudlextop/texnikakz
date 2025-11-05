import { ApiProperty } from '@nestjs/swagger';
import { PromotionDto } from './promotion.dto';

export class ApplyPromotionResultDto {
  @ApiProperty({ type: PromotionDto })
  promotion!: PromotionDto;

  @ApiProperty()
  boostScore!: number;
}
