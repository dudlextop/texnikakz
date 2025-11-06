import Link from 'next/link';
import { ListingCard, SearchBar } from '../../../../../components';
import type { ListingFilters, ListingsApiResponse } from '../../../../../types';
import { serverApiFetch } from '../../../../../lib/server-api';

export const dynamic = 'force-dynamic';

const statusFilters = [
  { value: undefined, label: 'Все' },
  { value: 'draft', label: 'Черновики' },
  { value: 'pending', label: 'На модерации' },
  { value: 'published', label: 'Опубликованные' }
];

export default async function ProfileListingsPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters: ListingFilters = {
    q: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    sort: 'newest',
    limit: 12,
    offset: 0
  };
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  if (status) {
    (filters as Record<string, unknown>).status = status;
  }

  const listings = await serverApiFetch<ListingsApiResponse>('/listings', {
    searchParams: filters as Record<string, unknown>
  }).catch(() => ({ items: [], total: 0, limit: 0, offset: 0, facets: { categories: [] } }));

  const buildFilterLink = (statusValue: string | undefined) => {
    const paramsCopy = new URLSearchParams();
    if (filters.q) paramsCopy.set('q', filters.q);
    if (statusValue) paramsCopy.set('status', statusValue);
    const qs = paramsCopy.toString();
    return qs ? `?${qs}` : '?';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Мои объявления</h1>
          <p className="text-sm text-slate-600">Управляйте публикациями, редактируйте и запускайте продвижения.</p>
        </div>
        <Link
          href={`/${params.locale}/listing/create`}
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Новое объявление
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <SearchBar placeholder="Поиск по объявлениям" queryKey="q" targetPath={`/${params.locale}/profile/listings`} />
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {statusFilters.map((option) => (
            <Link
              key={option.label}
              href={buildFilterLink(option.value)}
              className={`rounded-full px-4 py-1 ${
                option.value === status
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {listings.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Объявления не найдены. Попробуйте изменить фильтр или создайте новое объявление.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {listings.items.map((listing) => (
            <div key={listing.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <ListingCard locale={params.locale} listing={listing} />
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 capitalize">{listing.status ?? 'draft'}</span>
                {listing.promotionTypes?.map((promo) => (
                  <span key={promo} className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                    {promo.toUpperCase()}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href={`/${params.locale}/listing/create?edit=${listing.id}`}
                  className="rounded-full border border-slate-300 px-4 py-1 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                >
                  Редактировать
                </Link>
                <button className="rounded-full border border-slate-300 px-4 py-1 text-slate-600 hover:border-blue-300 hover:text-blue-600">
                  Запустить VIP
                </button>
                <button className="rounded-full border border-slate-300 px-4 py-1 text-slate-600 hover:border-blue-300 hover:text-blue-600">
                  Поднять в топ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
