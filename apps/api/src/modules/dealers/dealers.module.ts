import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { DealersController } from './dealers.controller';
import { DealersService } from './dealers.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [DealersController],
  providers: [DealersService],
  exports: [DealersService]
})
export class DealersModule {}
