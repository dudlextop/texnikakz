import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { OtpService } from './otp.service';

interface AuthUserPayload {
  id: string;
  phone: string;
  role: UserRole;
  dealerId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isVerified: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService
  ) {}

  async requestOtp(phone: string) {
    const code = this.otpService.requestOtp(phone);
    return { code };
  }

  async verifyOtp(phone: string, code: string) {
    this.otpService.verifyOtp(phone, code);
    const now = new Date();

    const upsertData: Prisma.UserUpsertArgs = {
      where: { phone },
      create: {
        phone,
        role: UserRole.USER,
        isVerified: true,
        lastLoginAt: now
      },
      update: {
        isVerified: true,
        lastLoginAt: now
      }
    };

    const user = await this.prisma.user.upsert(upsertData);
    const token = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
      dealerId: user.dealerId ?? null
    });

    return {
      token,
      user: this.mapUser(user)
    };
  }

  getAuthenticatedUser(payload: AuthenticatedUser): Promise<AuthUserPayload | null> {
    return this.prisma.user
      .findUnique({ where: { id: payload.id } })
      .then((user) => (user ? this.mapUser(user) : null));
  }

  private mapUser(user: {
    id: string;
    phone: string;
    role: UserRole;
    dealerId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    isVerified: boolean;
  }): AuthUserPayload {
    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      dealerId: user.dealerId,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified
    };
  }
}
