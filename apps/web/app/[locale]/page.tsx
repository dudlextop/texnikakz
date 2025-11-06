import Link from 'next/link';

const categories = [
  'Экскаваторы',
  'Погрузчики',
  'Краны',
  'Бульдозеры',
  'Трактора',
  'Самосвалы',
  'Прицепы',
  'Операторы'
];

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-blue-600 p-10 text-white shadow-lg">
          <h1 className="text-3xl font-semibold">Texnika.kz</h1>
          <p className="mt-4 text-lg">
            Экосистема спецтехники и профессиональных операторов: объявления, дилеры, специалисты и сервисные пакеты в одном месте.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/listings`}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-blue-600 shadow"
            >
              Смотреть технику
            </Link>
            <Link
              href={`/${locale}/specialists`}
              className="rounded-full border border-white/80 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Найти оператора
            </Link>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Популярные категории</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/${locale}/listings?category=${encodeURIComponent(category)}`}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Фасетный поиск</h3>
          <p className="mt-2 text-sm text-slate-600">
            Мгновенный подбор техники по региону, цене, параметрам, продавцам и платным статусам.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Каталог операторов</h3>
          <p className="mt-2 text-sm text-slate-600">
            Профили операторов с опытом, сертификатами, ставками и возможностью нанять прямо на площадке.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Продвижение и биллинг</h3>
          <p className="mt-2 text-sm text-slate-600">
            VIP/TOP/Highlight/Autobump, mock-платежи и аналитика эффективности для дилеров и специалистов.
          </p>
        </div>
      </section>
    </main>
  );
}
