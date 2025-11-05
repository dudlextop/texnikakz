import { Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'texnika_session';

export const authCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
} as const;

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
}

export function clearAuthCookie(res: Response) {
  res.cookie(AUTH_COOKIE_NAME, '', { ...authCookieOptions, maxAge: 0 });
}
