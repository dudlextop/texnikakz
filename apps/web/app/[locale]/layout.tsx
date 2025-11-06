import type { Metadata } from 'next';
import Link from 'next/link';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { Inter } from 'next/font/google';
import { QueryProvider } from '../../components/providers/query-provider';
import '../globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Texnika.kz',
  description: 'Маркетплейс спецтехники и операторов по Казахстану.'
};

const navLinks = [
  { href: '/listings', label: 'Объявления' },
  { href: '/specialists', label: 'Специалисты' },
  { href: '/listing/create', label: 'Разместить' },
  { href: '/profile', label: 'Кабинет' }
];

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();

  return (
    <html lang={params.locale} className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
                  <Link href={`/${params.locale}`} className="text-lg font-semibold text-blue-600">
                    Texnika.kz
                  </Link>
                  <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
                    {navLinks.map((link) => (
                      <Link key={link.href} href={`/${params.locale}${link.href}`} className="hover:text-blue-600">
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </header>

              <main className="flex-1">{children}</main>

              <footer className="border-t border-slate-200 bg-white py-10 text-sm text-slate-600">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 md:flex-row md:items-center md:justify-between">
                  <p>© {new Date().getFullYear()} Texnika.kz. Все права защищены.</p>
                  <div className="flex gap-4">
                    <Link href={`/${params.locale}/listings`}>Каталог техники</Link>
                    <Link href={`/${params.locale}/specialists`}>Каталог специалистов</Link>
                    <Link href={`/${params.locale}/login`}>Вход</Link>
                  </div>
                </div>
              </footer>
            </div>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
