import { EmptyState, SpecialistCard } from '../../../../components';
import type { SpecialistFilters, SpecialistsApiResponse } from '../../../../types';
import { serverApiFetch } from '../../../../lib/server-api';
import { SpecialistsFiltersClient } from './_components/filters.client';

export const dynamic = 'force-dynamic';

function parseFilters(searchParams: Record<string, string | string[] | undefined>): SpecialistFilters {
  const getNumber = (value?: string | string[]) => {
    if (!value) return undefined;
    const raw = Array.isArray(value) ? value[0] : value;
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const sort = searchParams.sort;
  return {
    q: Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q,
    cityId: Array.isArray(searchParams.cityId) ? searchParams.cityId[0] : searchParams.cityId,
    profession: Array.isArray(searchParams.profession) ? searchParams.profession[0] : searchParams.profession,
    availability: Array.isArray(searchParams.availability) ? searchParams.availability[0] : searchParams.availability,
    minExperience: getNumber(searchParams.minExperience),
    rateFrom: getNumber(searchParams.rateFrom),
    rateTo: getNumber(searchParams.rateTo),
    withEquipment: searchParams.withEquipment === 'true' ? true : undefined,
    sort: sort === 'rating' || sort === 'experience' || sort === 'price' || sort === 'reviews' ? sort : 'rating',
    limit: Math.min(getNumber(searchParams.limit) ?? 20, 50),
    offset: getNumber(searchParams.offset) ?? 0
  };
}

const sortOptions: { value: NonNullable<SpecialistFilters['sort']>; label: string }[] = [
  { value: 'rating', label: 'Рейтинг' },
  { value: 'experience', label: 'Опыт' },
  { value: 'price', label: 'Цена' },
  { value: 'reviews', label: 'Отзывы' }
];

export default async function SpecialistsCatalogPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseFilters(searchParams);
  const response = await serverApiFetch<SpecialistsApiResponse>('/specialists', {
    searchParams: {
      ...filters,
      limit: filters.limit,
      offset: filters.offset
    }
  });

  const items = response.items ?? [];
  const total = response.total ?? 0;
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const buildSortLink = (value: string) => {
    const paramsCopy = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (key === 'sort' || key === 'offset') return;
      paramsCopy.set(key, String(value));
    });
    paramsCopy.set('sort', value);
    paramsCopy.set('offset', '0');
    paramsCopy.set('limit', String(limit));
    return `?${paramsCopy.toString()}`;
  };

  const buildPageLink = (page: number) => {
    const paramsCopy = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (key === 'offset') return;
      paramsCopy.set(key, String(value));
    });
    paramsCopy.set('offset', String((page - 1) * limit));
    paramsCopy.set('limit', String(limit));
    return `?${paramsCopy.toString()}`;
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Каталог операторов</h1>
          <p className="text-sm text-slate-600">
            Наймите опытных операторов спецтехники. Отбор по навыкам, стажу, ставкам и наличию собственной техники.
          </p>
        </div>
        <SpecialistsFiltersClient initialFilters={filters} />
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span className="text-xs uppercase tracking-wide text-slate-500">Сортировка:</span>
          {sortOptions.map((option) => (
            <a
              key={option.value}
              href={buildSortLink(option.value)}
              className={`rounded-full border px-4 py-1 ${
                filters.sort === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              {option.label}
            </a>
          ))}
        </div>
      </div>
      <section className="space-y-6">
        {items.length === 0 ? (
          <EmptyState
            title="Специалисты не найдены"
            description="Попробуйте изменить параметры поиска или выберите другой регион."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((specialist) => (
              <SpecialistCard key={specialist.id} locale={params.locale} specialist={specialist} />
            ))}
          </div>
        )}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <span>
            Показано {items.length} из {total} специалистов
          </span>
          <div className="flex items-center gap-2">
            <a
              href={buildPageLink(Math.max(1, currentPage - 1))}
              aria-disabled={currentPage === 1}
              className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 aria-disabled:opacity-40 aria-disabled:pointer-events-none"
            >
              Назад
            </a>
            <span>
              Страница {currentPage} из {totalPages}
            </span>
            <a
              href={buildPageLink(Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage >= totalPages}
              className="rounded-full border border-slate-300 px-3 py-1 text-slate-600 aria-disabled:opacity-40 aria-disabled:pointer-events-none"
            >
              Вперёд
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
