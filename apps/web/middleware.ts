import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ru', 'kk'],
  defaultLocale: 'ru'
});

export const config = {
  matcher: ['/', '/(ru|kk)/:path*']
};
