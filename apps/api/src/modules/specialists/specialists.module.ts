import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { SpecialistsController } from './specialists.controller';
import { SpecialistsService } from './specialists.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SpecialistsController],
  providers: [SpecialistsService],
  exports: [SpecialistsService]
})
export class SpecialistsModule {}
