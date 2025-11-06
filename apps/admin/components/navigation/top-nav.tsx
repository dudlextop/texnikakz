'use client';

import { Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import type { AdminUser } from '@/lib/types';

interface TopNavProps {
  currentUser: AdminUser;
}

export function TopNav({ currentUser }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-300 transition hover:bg-slate-800 lg:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-medium text-slate-200">Texnika.kz Admin</p>
          <p className="text-xs text-slate-400">Управление качеством и безопасностью площадки</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-300">
        <span className="hidden md:inline-flex">{currentUser.phone}</span>
        <form method="post" action="/api/logout" className="hidden lg:inline">
          <Link
            href="/logout"
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-300 transition hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </Link>
        </form>
      </div>
      {menuOpen ? (
        <nav className="absolute left-0 top-full w-full border-b border-slate-800 bg-slate-900/95 px-6 py-4 lg:hidden">
          <ul className="space-y-3 text-sm text-slate-200">
            <li>
              <Link href="/admin/dashboard" className="block" onClick={() => setMenuOpen(false)}>
                Дашборд
              </Link>
            </li>
            <li>
              <Link href="/admin/listings" className="block" onClick={() => setMenuOpen(false)}>
                Объявления
              </Link>
            </li>
            <li>
              <Link href="/admin/specialists" className="block" onClick={() => setMenuOpen(false)}>
                Специалисты
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="block" onClick={() => setMenuOpen(false)}>
                Пользователи
              </Link>
            </li>
            <li>
              <Link href="/admin/reports" className="block" onClick={() => setMenuOpen(false)}>
                Жалобы
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
