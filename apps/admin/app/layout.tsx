import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Texnika.kz Admin',
  description: 'Панель модерации Texnika.kz для администраторов и модераторов',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="h-full bg-slate-950">
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100">
        {children}
      </body>
    </html>
  );
}
