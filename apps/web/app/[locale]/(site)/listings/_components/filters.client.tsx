'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { ListingFacetOption, ListingFilters } from '../../../../types';
import { ListingsFilterPanel, ListingsFilterToolbar } from '../../../../components';

function toQuery(filters: ListingFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) {
      return;
    }
    if (key === 'limit' || key === 'offset') {
      return;
    }
    params.set(key, String(value));
  });
  return params.toString();
}

interface FilterPanelProps {
  initialFilters: ListingFilters;
  categories: ListingFacetOption[];
  cities?: ListingFacetOption[];
  total: number;
}

export function ListingsFiltersClient({ initialFilters, categories, cities = [], total }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (nextFilters: ListingFilters) => {
    const qs = toQuery(nextFilters);
    router.push(qs ? `?${qs}` : '?');
  };

  return (
    <div className="space-y-4">
      <ListingsFilterToolbar
        filters={initialFilters}
        total={total}
        onSortChange={(sort) => navigate({ ...initialFilters, sort, offset: undefined })}
        onReset={() => navigate({})}
      />
      <ListingsFilterPanel
        initialFilters={initialFilters}
        categories={categories}
        cities={cities}
        onApply={(filters) => navigate({ ...filters, sort: initialFilters.sort, offset: undefined })}
      />
      {searchParams.has('q') && (
        <p className="text-xs text-slate-500">Поиск: «{searchParams.get('q')}»</p>
      )}
    </div>
  );
}
