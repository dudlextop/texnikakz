import { Injectable, TooManyRequestsException, UnauthorizedException } from '@nestjs/common';

interface OtpRecord {
  code: string;
  expiresAt: number;
}

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

@Injectable()
export class OtpService {
  private readonly otpTtlMs = Number(process.env.OTP_TTL_MS ?? 5 * 60 * 1000);
  private readonly rateLimitWindowMs = Number(process.env.OTP_RATE_LIMIT_WINDOW_MS ?? 60 * 1000);
  private readonly rateLimitMax = Number(process.env.OTP_RATE_LIMIT ?? 3);
  private readonly devCode = process.env.OTP_DEV_CODE ?? '1111';

  private readonly codes = new Map<string, OtpRecord>();
  private readonly rateLimits = new Map<string, RateLimitRecord>();

  requestOtp(phone: string) {
    const now = Date.now();
    const rateRecord = this.rateLimits.get(phone);
    if (!rateRecord || now - rateRecord.windowStart > this.rateLimitWindowMs) {
      this.rateLimits.set(phone, { count: 1, windowStart: now });
    } else if (rateRecord.count >= this.rateLimitMax) {
      throw new TooManyRequestsException('OTP requests are rate limited');
    } else {
      rateRecord.count += 1;
      this.rateLimits.set(phone, rateRecord);
    }

    const code = this.generateCode();
    this.codes.set(phone, { code, expiresAt: now + this.otpTtlMs });
    return code;
  }

  verifyOtp(phone: string, code: string) {
    const record = this.codes.get(phone);
    if (!record) {
      throw new UnauthorizedException('OTP not requested');
    }
    if (Date.now() > record.expiresAt) {
      this.codes.delete(phone);
      throw new UnauthorizedException('OTP expired');
    }

    if (record.code !== code && code !== this.devCode) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    this.codes.delete(phone);
    return true;
  }

  private generateCode() {
    if (process.env.NODE_ENV !== 'production') {
      return this.devCode;
    }
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
}
