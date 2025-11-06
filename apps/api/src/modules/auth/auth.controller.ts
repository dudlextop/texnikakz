import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { clearAuthCookie, setAuthCookie } from '../common/utils/cookie.utils';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/request')
  async requestOtp(@Body() dto: RequestOtpDto) {
    const { code } = await this.authService.requestOtp(dto.phone);
    return {
      success: true,
      ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : {})
    };
  }

  @Post('otp/verify')
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.authService.verifyOtp(dto.phone, dto.code);
    setAuthCookie(res, token);
    return { success: true, user };
  }

  @Post('logout')
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response, @CurrentUser() user: AuthenticatedUser | undefined) {
    if (user) {
      clearAuthCookie(res);
    }
    return { success: true };
  }
}
