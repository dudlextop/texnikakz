import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '+77010000000' })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('KZ')
  phone!: string;

  @ApiProperty({ example: '1111' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 6)
  code!: string;
}
