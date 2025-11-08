import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { SearchModule } from '../search/search.module';
import { PricingController } from './controllers/pricing.controller';
import { OrdersController } from './controllers/orders.controller';
import { TransactionsController } from './controllers/transactions.controller';
import { WalletController } from './controllers/wallet.controller';
import { WebhooksController } from './controllers/webhooks.controller';
import { OrdersService } from './services/orders.service';
import { PricingService } from './services/pricing.service';
import { WalletService } from './services/wallet.service';

@Module({
  imports: [DatabaseModule, AuthModule, SearchModule],
  controllers: [PricingController, WalletController, OrdersController, TransactionsController, WebhooksController],
  providers: [PricingService, WalletService, OrdersService],
  exports: [PricingService, WalletService, OrdersService]
})
export class BillingModule {}
