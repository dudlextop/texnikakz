import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { TopupWalletDto } from '../dto/topup-wallet.dto';
import { WalletDto } from '../dto/wallet.dto';
import { WalletService } from '../services/wallet.service';

@ApiTags('billing')
@Controller('billing/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Return wallet balance and recent transactions for the current user' })
  @ApiOkResponse({ type: WalletDto })
  getWallet(@CurrentUser() user: AuthenticatedUser): Promise<WalletDto> {
    return this.walletService.getWallet(user.id);
  }

  @Post('topup')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mock top up of the user wallet balance' })
  @ApiOkResponse({ type: WalletDto })
  topUp(
    @Body() dto: TopupWalletDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<WalletDto> {
    return this.walletService.topUp(user.id, dto.amountKzt);
  }
}
