import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, MaxLength, ArrayNotEmpty } from 'class-validator';

export enum BulkModerationAction {
  PUBLISH = 'publish',
  REJECT = 'reject',
}

export class BulkModerateListingsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids!: string[];

  @ApiProperty({ enum: BulkModerationAction })
  @IsEnum(BulkModerationAction)
  action!: BulkModerationAction;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class BulkModerationResultDto {
  @ApiProperty({ type: [String] })
  succeeded!: string[];

  @ApiProperty({ type: [String] })
  failed!: string[];
}
