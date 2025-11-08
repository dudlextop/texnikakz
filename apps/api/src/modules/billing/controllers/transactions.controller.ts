import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { WalletTransactionDto } from '../dto/wallet.dto';
import { WalletService } from '../services/wallet.service';

@ApiTags('billing')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing/transactions')
export class TransactionsController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  @ApiOperation({ summary: 'List wallet transactions for the current user' })
  @ApiOkResponse({ type: [WalletTransactionDto] })
  listMyTransactions(@CurrentUser() user: AuthenticatedUser): Promise<WalletTransactionDto[]> {
    return this.walletService.listTransactions(user.id);
  }
}
