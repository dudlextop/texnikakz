import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { DealerSummaryDto } from './dealer-summary.dto';

export class UserProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  phone!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ nullable: true })
  firstName?: string | null;

  @ApiProperty({ nullable: true })
  lastName?: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl?: string | null;

  @ApiProperty()
  isVerified!: boolean;

  @ApiProperty({ type: () => DealerSummaryDto, nullable: true })
  dealer?: DealerSummaryDto | null;
}
