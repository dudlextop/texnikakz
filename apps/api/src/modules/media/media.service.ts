import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Media, MediaKind, Prisma } from '@prisma/client';
import { Client } from 'minio';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { AttachMediaDto } from './dto/attach-media.dto';
import { MediaDto } from './dto/media.dto';
import { MediaTargetType, PresignMediaDto } from './dto/presign-media.dto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly bucketName: string;
  private readonly presignTtlSeconds: number;
  private readonly publicBaseUrl?: string;
  private readonly maxFileSize: number;
  private readonly allowedMimePrefixes = ['image/'];
  private bucketEnsured = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject('MINIO_CLIENT') private readonly minioClient: Client
  ) {
    this.bucketName = this.configService.get<string>('MEDIA_BUCKET', 'texnika-media');
    this.presignTtlSeconds = Number(this.configService.get<string>('MEDIA_PRESIGN_TTL', '900'));
    this.publicBaseUrl = this.configService.get<string>('MEDIA_PUBLIC_URL');
    this.maxFileSize = Number(this.configService.get<string>('MEDIA_MAX_FILE_SIZE', `${25 * 1024 * 1024}`));
  }

  async presign(dto: PresignMediaDto) {
    if (!this.allowedMimePrefixes.some((prefix) => dto.contentType.startsWith(prefix))) {
      throw new BadRequestException('Unsupported content type');
    }
    if (dto.fileSize > this.maxFileSize) {
      throw new BadRequestException('File too large');
    }

    await this.ensureBucket();

    const extension = this.extractExtension(dto.filename);
    const folder = dto.target === MediaTargetType.LISTING ? 'listings' : 'specialists';
    const reference = dto.referenceId ? `${dto.referenceId}/` : '';
    const objectKey = `${folder}/${reference}${randomUUID()}${extension}`;
    const expires = this.presignTtlSeconds;

    const url = await this.minioClient.presignedPutObject(this.bucketName, objectKey, expires, {
      'Content-Type': dto.contentType
    });

    return {
      url,
      bucket: this.bucketName,
      objectKey,
      expiresIn: expires
    };
  }

  async attach(dto: AttachMediaDto, userId: string): Promise<MediaDto> {
    if (!dto.listingId && !dto.specialistId) {
      throw new BadRequestException('listingId or specialistId is required');
    }

    if (dto.listingId) {
      const listingExists = await this.prisma.listing.count({ where: { id: dto.listingId } });
      if (!listingExists) {
        throw new BadRequestException('Listing not found');
      }
    }
    if (dto.specialistId) {
      const specialistExists = await this.prisma.specialist.count({ where: { id: dto.specialistId } });
      if (!specialistExists) {
        throw new BadRequestException('Specialist not found');
      }
    }

    const url = dto.url ?? this.buildPublicUrl(dto.bucket, dto.objectKey);
    const media = await this.prisma.media.create({
      data: {
        bucket: dto.bucket,
        objectKey: dto.objectKey,
        url,
        previewUrl: dto.previewUrl ?? null,
        kind: dto.kind ?? MediaKind.IMAGE,
        listingId: dto.listingId ?? null,
        specialistId: dto.specialistId ?? null,
        metadata: {
          attachedBy: userId,
          attachedAt: new Date().toISOString()
        }
      }
    });

    return this.toDto(media);
  }

  private toDto(media: Media): MediaDto {
    return {
      id: media.id,
      kind: media.kind,
      bucket: media.bucket,
      objectKey: media.objectKey,
      url: media.url,
      previewUrl: media.previewUrl ?? null
    };
  }

  private async ensureBucket() {
    if (this.bucketEnsured) {
      return;
    }
    const exists = await this.minioClient.bucketExists(this.bucketName).catch((err) => {
      this.logger.warn(`Failed to verify bucket ${this.bucketName}: ${err.message}`);
      return false;
    });
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, '');
    }
    this.bucketEnsured = true;
  }

  private buildPublicUrl(bucket: string, objectKey: string) {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${objectKey}`;
    }
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get<string>('MINIO_PORT', '9000');
    const protocol = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true' ? 'https' : 'http';
    return `${protocol}://${endpoint}:${port}/${bucket}/${objectKey}`;
  }

  private extractExtension(filename: string) {
    const index = filename.lastIndexOf('.');
    if (index === -1) {
      return '';
    }
    return filename.slice(index);
  }
}
