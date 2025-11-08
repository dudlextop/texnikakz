import { Injectable } from '@nestjs/common';
import { PricingPlan } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PricingPlanDto } from '../dto/pricing-plan.dto';

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async listActivePlans(): Promise<PricingPlanDto[]> {
    const plans = await this.prisma.pricingPlan.findMany({
      where: { active: true },
      orderBy: [
        { priceKzt: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return plans.map((plan) => this.toDto(plan));
  }

  private toDto(plan: PricingPlan): PricingPlanDto {
    return {
      id: plan.id,
      code: plan.code,
      title: plan.title,
      description: plan.description,
      priceKzt: plan.priceKzt,
      durationDays: plan.durationDays,
      active: plan.active,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    };
  }
}
