import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MockWebhookDto } from '../dto/mock-webhook.dto';
import { OrderDto } from '../dto/order.dto';
import { OrdersService } from '../services/orders.service';

@ApiTags('billing')
@Controller('billing/webhooks')
export class WebhooksController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('mock')
  @ApiOperation({ summary: 'Handle mock payment provider callbacks' })
  @ApiOkResponse({ type: OrderDto })
  handleMockWebhook(@Body() dto: MockWebhookDto): Promise<OrderDto> {
    return this.ordersService.handleMockWebhook(dto);
  }
}
