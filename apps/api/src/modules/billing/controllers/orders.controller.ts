import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderDto } from '../dto/order.dto';
import { PayOrderDto, PayOrderMode } from '../dto/pay-order.dto';
import { OrdersService } from '../services/orders.service';

@ApiTags('billing')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a billing order for promotions' })
  @ApiCreatedResponse({ type: OrderDto })
  createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<OrderDto> {
    return this.ordersService.createOrder(user, dto);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Confirm payment for a billing order' })
  @ApiOkResponse({ type: OrderDto })
  payOrder(
    @Param('id') id: string,
    @Body() dto: PayOrderDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<OrderDto> {
    const mode = dto.mode ?? PayOrderMode.WALLET;
    return this.ordersService.payOrder(id, user, mode);
  }

  @Get('me')
  @ApiOperation({ summary: 'List billing orders created by the current user' })
  @ApiOkResponse({ type: [OrderDto] })
  listMyOrders(@CurrentUser() user: AuthenticatedUser): Promise<OrderDto[]> {
    return this.ordersService.listOrdersForUser(user.id);
  }
}
