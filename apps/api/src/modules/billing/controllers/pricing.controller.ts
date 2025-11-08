import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PricingPlanDto } from '../dto/pricing-plan.dto';
import { PricingService } from '../services/pricing.service';

@ApiTags('billing')
@Controller('billing/pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List active promotion pricing plans' })
  @ApiOkResponse({ type: [PricingPlanDto] })
  listPlans(): Promise<PricingPlanDto[]> {
    return this.pricingService.listActivePlans();
  }
}
