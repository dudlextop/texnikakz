import './globals.css';

export const metadata = {
  title: 'Texnika.kz Admin',
  description: 'Панель модерации и биллинга Texnika.kz'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
          <header className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
            <h1 className="text-2xl font-semibold">Texnika.kz — Admin</h1>
            <p className="mt-2 text-sm text-slate-400">
              Управление модерацией объявлений, специалистами и продвижением.
            </p>
          </header>
          <main className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
