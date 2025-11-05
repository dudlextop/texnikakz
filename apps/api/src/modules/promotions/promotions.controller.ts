import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { ApplyPromotionDto } from './dto/apply-promotion.dto';
import { ApplyPromotionResultDto } from './dto/apply-promotion.result';
import { PromotionsService } from './promotions.service';

@ApiTags('promotions')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('listings/:id/promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @ApiOkResponse({ type: ApplyPromotionResultDto })
  apply(
    @Param('id') listingId: string,
    @Body() dto: ApplyPromotionDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.promotionsService.applyPromotion(listingId, dto, user);
  }
}
