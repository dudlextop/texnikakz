'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface NavItem {
  href: string;
  translationKey: string;
}

const nav: NavItem[] = [
  { href: '', translationKey: 'menu.overview' },
  { href: '/listings', translationKey: 'menu.listings' },
  { href: '/messages', translationKey: 'menu.messages' },
  { href: '/wallet', translationKey: 'menu.wallet' },
  { href: '/orders', translationKey: 'menu.orders' }
];

export function ProfileSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = useTranslations('profile');

  return (
    <aside className="w-64 space-y-2">
      <h2 className="text-xl font-semibold text-slate-900">{t('title')}</h2>
      <nav className="mt-4 flex flex-col gap-2 text-sm text-slate-700">
        {nav.map((item) => {
          const href = `/${locale}/profile${item.href}`;
          const isActive = pathname === href;
          return (
            <Link
              key={item.href}
              href={href}
              className={`rounded-lg px-3 py-2 ${
                isActive ? 'bg-blue-50 font-semibold text-blue-600' : 'hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {t(item.translationKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
