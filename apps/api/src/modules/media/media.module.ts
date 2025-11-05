import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule],
  controllers: [MediaController],
  providers: [
    MediaService,
    {
      provide: 'MINIO_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Client({
          endPoint: config.get<string>('MINIO_ENDPOINT', 'localhost'),
          port: Number(config.get<string>('MINIO_PORT', '9000')),
          accessKey: config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
          secretKey: config.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
          useSSL: config.get<string>('MINIO_USE_SSL', 'false') === 'true'
        })
    }
  ],
  exports: [MediaService]
})
export class MediaModule {}
