import { createTranslator } from 'next-intl/server';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  i18n: {
    locales: ['ru', 'kk'],
    defaultLocale: 'ru'
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      }
    ];
  }
};

export default config;
