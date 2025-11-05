import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { DealersModule } from './dealers/dealers.module';
import { ListingsModule } from './listings/listings.module';
import { ChatModule } from './chat/chat.module';
import { MediaModule } from './media/media.module';
import { PromotionsModule } from './promotions/promotions.module';
import { SearchModule } from './search/search.module';
import { SpecialistsModule } from './specialists/specialists.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100
      }
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    DealersModule,
    ListingsModule,
    SpecialistsModule,
    MediaModule,
    ChatModule,
    PromotionsModule,
    SearchModule
  ]
})
export class AppModule {}
