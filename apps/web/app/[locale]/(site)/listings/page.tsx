import { LISTING_CATEGORIES } from '@texnikakz/shared/constants/domains';
import { EmptyState, ListingCard, SearchBar } from '../../../../components';
import type { ListingFilters, ListingsApiResponse } from '../../../../types';
import { serverApiFetch } from '../../../../lib/server-api';
import { ListingsFiltersClient } from './_components/filters.client';

export const dynamic = 'force-dynamic';

function parseFilters(searchParams: Record<string, string | string[] | undefined>): ListingFilters {
  const getNumber = (value?: string | string[]) => {
    if (!value) return undefined;
    const str = Array.isArray(value) ? value[0] : value;
    const parsed = Number(str);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const sort = searchParams.sort;
  return {
    q: Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q,
    categoryId: Array.isArray(searchParams.categoryId) ? searchParams.categoryId[0] : searchParams.categoryId,
    cityId: Array.isArray(searchParams.cityId) ? searchParams.cityId[0] : searchParams.cityId,
    priceFrom: getNumber(searchParams.priceFrom),
    priceTo: getNumber(searchParams.priceTo),
    yearFrom: getNumber(searchParams.yearFrom),
    yearTo: getNumber(searchParams.yearTo),
    dealerId: Array.isArray(searchParams.dealerId) ? searchParams.dealerId[0] : searchParams.dealerId,
    hasMedia: searchParams.hasMedia === 'true' ? true : undefined,
    sort: sort === 'price_asc' || sort === 'price_desc' || sort === 'year_desc' || sort === 'newest' ? sort : 'relevance',
    limit: Math.min(getNumber(searchParams.limit) ?? 20, 50),
    offset: getNumber(searchParams.offset) ?? 0
  };
}

function mapCategoryLabel(id: string) {
  const match = LISTING_CATEGORIES.find((category) => category.toLowerCase() === id.toLowerCase());
  return match ?? id;
}

export default async function ListingsCatalogPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseFilters(searchParams);
  const response = await serverApiFetch<ListingsApiResponse>('/listings', {
    searchParams: {
      ...filters,
      limit: filters.limit,
      offset: filters.offset
    }
  });

  const items = response.items ?? [];
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;
  const total = response.total ?? 0;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const categories = (response.facets?.categories ?? []).map((facet) => ({
    id: facet.id,
    label: mapCategoryLabel(facet.id),
    count: facet.count
  }));

  const buildPageLink = (page: number) => {
    const paramsCopy = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (key === 'offset') return;
      paramsCopy.set(key, String(value));
    });
    paramsCopy.set('offset', String((page - 1) * limit));
    paramsCopy.set('limit', String(limit));
    const qs = paramsCopy.toString();
    return qs ? `?${qs}` : '?';
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Каталог спецтехники</h1>
          <p className="text-sm text-slate-600">
            Подберите технику по категории, региону, цене и параметрам. Рейтинг и продвижения влияют на выдачу.
          </p>
        </div>
        <SearchBar placeholder="Поиск техники" queryKey="q" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
        <ListingsFiltersClient initialFilters={filters} categories={categories} total={total} />
        <section className="space-y-6">
          {items.length === 0 ? (
            <EmptyState
              title="Объявления не найдены"
              description="Попробуйте изменить фильтры или расширить область поиска."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((listing) => (
                <ListingCard key={listing.id} locale={params.locale} listing={listing} />
              ))}
            </div>
          )}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <span>
              Показано {items.length} из {total} объявлений
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => {
                  const url = buildPageLink(Math.max(1, currentPage - 1));
                  window.location.href = url;
                }}
                className="rounded-full border border-slate-300 px-3 py-1 disabled:opacity-40"
              >
                Назад
              </button>
              <span>
                Страница {currentPage} из {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  const url = buildPageLink(Math.min(totalPages, currentPage + 1));
                  window.location.href = url;
                }}
                className="rounded-full border border-slate-300 px-3 py-1 disabled:opacity-40"
              >
                Вперёд
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
