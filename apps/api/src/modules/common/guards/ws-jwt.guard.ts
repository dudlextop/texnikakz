import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_COOKIE_NAME } from '../utils/cookie.utils';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const client = context.switchToWs().getClient();
    const cookieHeader: string | undefined = client.handshake?.headers?.cookie;
    if (!cookieHeader) {
      throw new UnauthorizedException('Missing auth cookie');
    }
    const cookies = this.parseCookies(cookieHeader);
    const token = cookies[AUTH_COOKIE_NAME];
    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }
    try {
      const payload = this.jwtService.verify(token);
      const user: AuthenticatedUser = {
        id: payload.sub,
        role: payload.role,
        dealerId: payload.dealerId ?? null
      };
      client.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid auth token');
    }
  }

  private parseCookies(header: string) {
    return header.split(';').reduce<Record<string, string>>((acc, part) => {
      const [key, value] = part.trim().split('=');
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {});
  }
}
