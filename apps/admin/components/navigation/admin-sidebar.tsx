'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Home, Layers, ListChecks, Users2, ShieldAlert } from 'lucide-react';
import type { AdminUser } from '@/lib/types';

const NAVIGATION_ITEMS = [
  {
    label: 'Дашборд',
    href: '/admin/dashboard',
    icon: Home,
  },
  {
    label: 'Объявления',
    href: '/admin/listings',
    icon: ListChecks,
  },
  {
    label: 'Специалисты',
    href: '/admin/specialists',
    icon: Layers,
  },
  {
    label: 'Пользователи',
    href: '/admin/users',
    icon: Users2,
  },
  {
    label: 'Жалобы',
    href: '/admin/reports',
    icon: ShieldAlert,
  },
] as const;

interface AdminSidebarProps {
  currentUser: AdminUser;
}

export function AdminSidebar({ currentUser }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-800 bg-slate-950/80 p-6 lg:flex">
      <div className="mb-10 space-y-2">
        <p className="text-lg font-semibold tracking-tight">Texnika.kz Admin</p>
        <p className="text-xs text-slate-400">Роль: {currentUser.role}</p>
        {currentUser.dealerId ? (
          <p className="text-xs text-slate-500">Дилер: {currentUser.dealerId}</p>
        ) : null}
      </div>
      <nav className="flex flex-1 flex-col gap-1 text-sm">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 transition',
                isActive
                  ? 'bg-slate-800 text-slate-50 shadow'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <footer className="mt-8 text-xs text-slate-500">
        Последний вход: {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleString() : '—'}
      </footer>
    </aside>
  );
}
