import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '+77010000000' })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('KZ')
  phone!: string;
}
