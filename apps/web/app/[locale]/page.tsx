import { LISTING_CATEGORIES } from '@texnikakz/shared/constants/domains';
import Link from 'next/link';
import { EmptyState, ListingCard, PromoBadgeGroup, SearchBar, SpecialistCard } from '../../components';
import type { ListingsApiResponse, SpecialistsApiResponse } from '../../types';
import { serverApiFetch } from '../../lib/server-api';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const [listingsResponse, specialistsResponse] = await Promise.all([
    serverApiFetch<ListingsApiResponse>('/listings', {
      searchParams: { limit: 9, sort: 'relevance' }
    }).catch(() => ({ items: [], total: 0, limit: 0, offset: 0, facets: { categories: [] } })),
    serverApiFetch<SpecialistsApiResponse>('/specialists', {
      searchParams: { limit: 6, sort: 'rating' }
    }).catch(() => ({ items: [], total: 0, limit: 0, offset: 0 }))
  ]);

  const vipListings = listingsResponse.items.filter((listing) => listing.promotionTypes?.includes('vip')).slice(0, 3);
  const topListings = listingsResponse.items
    .filter((listing) => listing.promotionTypes?.includes('top') || listing.promotionTypes?.includes('highlight'))
    .slice(0, 6);
  const latestListings = listingsResponse.items.slice(0, 6);

  const categoryLinks = LISTING_CATEGORIES.map((category) => ({
    label: category,
    href: `/${locale}/listings?categoryId=${encodeURIComponent(category)}`
  }));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12">
      <section className="grid gap-8 md:grid-cols-[1.4fr,1fr]">
        <div className="rounded-3xl bg-blue-600 p-10 text-white shadow-xl">
          <h1 className="text-4xl font-semibold">Texnika.kz</h1>
          <p className="mt-4 text-lg text-blue-50">
            Экосистема спецтехники и профессиональных операторов: объявления, дилеры, специалисты и платные продвижения в одном
            месте.
          </p>
          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <SearchBar placeholder="Поиск техники" queryKey="q" targetPath={`/${locale}/listings`} />
            <Link
              href={`/${locale}/listing/create`}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-blue-600 shadow"
            >
              Разместить объявление
            </Link>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Популярные категории</h2>
          <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
            {categoryLinks.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-slate-700 hover:border-blue-300 hover:text-blue-600"
              >
                {category.label}
                <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">VIP размещения</h2>
            <p className="text-sm text-slate-600">Лучшие предложения дилеров и владельцев техники с максимальным бустом.</p>
          </div>
          <PromoBadgeGroup promotions={['vip']} />
        </div>
        {vipListings.length === 0 ? (
          <EmptyState
            title="VIP-объявлений пока нет"
            description="Оформите продвижение, чтобы закрепиться на вершине выдачи."
            action={
              <Link
                href={`/${locale}/profile/listings`}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Управлять объявлениями
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {vipListings.map((listing) => (
              <ListingCard key={listing.id} locale={locale} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Свежие объявления</h2>
            <p className="text-sm text-slate-600">Свежие поступления спецтехники со всего Казахстана.</p>
          </div>
          <Link href={`/${locale}/listings`} className="text-sm font-semibold text-blue-600 hover:underline">
            Смотреть все
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {latestListings.map((listing) => (
            <ListingCard key={listing.id} locale={locale} listing={listing} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Рекомендуемые операторы</h2>
            <p className="text-sm text-slate-600">Выбирайте проверенных специалистов с отзывами и портфолио.</p>
          </div>
          <Link href={`/${locale}/specialists`} className="text-sm font-semibold text-blue-600 hover:underline">
            Каталог специалистов
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {specialistsResponse.items.map((specialist) => (
            <SpecialistCard key={specialist.id} locale={locale} specialist={specialist} />
          ))}
        </div>
      </section>

      {topListings.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">TOP продвижение</h2>
              <p className="text-sm text-slate-600">Объявления с усиленной выдачей и расширенной витриной.</p>
            </div>
            <PromoBadgeGroup promotions={['top', 'highlight']} />
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {topListings.map((listing) => (
              <ListingCard key={listing.id} locale={locale} listing={listing} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
