import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Texnika.kz — Маркетплейс спецтехники и операторов',
  description: 'Каталог спецтехники и операторов по Казахстану с фасетным поиском, чатом и продвижением.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
